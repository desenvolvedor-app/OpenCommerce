'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { validateDiscount } from '@/services/discount-service';
import { createOrder } from '@/services/order-service';
import {
    calculateShipping,
    calculateTax,
    getPaymentSettings,
    getShippingSettings,
    getStoreSettings,
    PaymentSettings,
    ShippingSettings,
    StoreSettings,
} from '@/services/settings-service';
import { useCartStore } from '@/store/cart-store';

const formSchema = z.object({
    firstName: z.string().min(2, { message: 'First name is required' }),
    lastName: z.string().min(2, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
    phone: z.string().min(5, { message: 'Phone number is required' }),
    address: z.string().min(5, { message: 'Address is required' }),
    city: z.string().min(2, { message: 'City is required' }),
    state: z.string().min(2, { message: 'State is required' }),
    postalCode: z.string().min(3, { message: 'Postal code is required' }),
    country: z.string().min(2, { message: 'Country is required' }),
    sameAsBilling: z.boolean(),
    paymentMethod: z.string({
        required_error: 'Please select a payment method',
    }),
    discountCode: z.string().optional(),
});

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Get cart state using the correct approach
    const items = useCartStore((state) => state.items);
    const subtotal = useCartStore((state) => state.subtotal());
    const discountAmount = useCartStore((state) => state.discountAmount());
    const tax = useCartStore((state) => state.tax());
    const total = useCartStore((state) => state.total());
    const discount = useCartStore((state) => state.discount);
    const setDiscount = useCartStore((state) => state.setDiscount);
    const shippingCost = useCartStore((state) => state.shippingCost);
    const setShippingCost = useCartStore((state) => state.setShippingCost);
    const setTaxRate = useCartStore((state) => state.setTaxRate);
    const clearCart = useCartStore((state) => state.clearCart);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
        null
    );
    const [shippingSettings, setShippingSettings] =
        useState<ShippingSettings | null>(null);
    const [paymentSettings, setPaymentSettings] =
        useState<PaymentSettings | null>(null);

    // Load store settings
    useEffect(() => {
        async function loadSettings() {
            try {
                setIsLoadingSettings(true);

                // Get all settings
                const [
                    storeSettingsData,
                    shippingSettingsData,
                    paymentSettingsData,
                ] = await Promise.all([
                    getStoreSettings(),
                    getShippingSettings(),
                    getPaymentSettings(),
                ]);

                setStoreSettings(storeSettingsData);
                setShippingSettings(shippingSettingsData);
                setPaymentSettings(paymentSettingsData);

                // Apply tax settings
                if (storeSettingsData.taxEnabled) {
                    setTaxRate(storeSettingsData.taxRate);
                } else {
                    setTaxRate(0);
                }

                // Calculate initial shipping (will be updated when country changes)
                const initialShipping = await calculateShipping(
                    'us',
                    undefined,
                    subtotal
                );
                setShippingCost(initialShipping);
            } catch (error) {
                console.error('Error loading settings:', error);
                toast.error('Could not load shipping and tax settings');
            } finally {
                setIsLoadingSettings(false);
            }
        }

        loadSettings();
    }, [setTaxRate, setShippingCost, subtotal]);

    const form = useForm<z.infer<typeof formSchema>, any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: user?.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'us',
            sameAsBilling: true,
            paymentMethod: 'card',
            discountCode: '',
        },
    });

    // Handle country change for shipping calculation
    const countryValue = form.watch('country');

    useEffect(() => {
        async function updateShipping() {
            try {
                if (!shippingSettings) return;

                const shipping = await calculateShipping(
                    countryValue,
                    undefined,
                    subtotal
                );
                setShippingCost(shipping);
            } catch (error) {
                console.error('Error calculating shipping:', error);
                toast.error('Could not calculate shipping for this country');
            }
        }

        if (countryValue && !isLoadingSettings) {
            updateShipping();
        }
    }, [
        countryValue,
        isLoadingSettings,
        setShippingCost,
        subtotal,
        shippingSettings,
    ]);

    // Handle discount code application
    const applyDiscount = async () => {
        if (!discountCode.trim()) {
            toast.error('Please enter a discount code');
            return;
        }

        setIsApplyingDiscount(true);

        try {
            const validDiscount = await validateDiscount(discountCode);

            if (!validDiscount) {
                toast.error('Invalid or expired discount code');
                return;
            }

            // Check minimum purchase if applicable
            if (
                validDiscount.minimumPurchase &&
                subtotal < validDiscount.minimumPurchase
            ) {
                toast.error(
                    `This code requires a minimum purchase of ${formatPrice(validDiscount.minimumPurchase)}`
                );
                return;
            }

            setDiscount(validDiscount);
            toast.success(`Discount applied: ${validDiscount.name}`);
            setDiscountCode('');
        } catch (error) {
            console.error('Error applying discount:', error);
            toast.error('Could not apply discount code');
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    // Remove applied discount
    const removeDiscount = () => {
        setDiscount(null);
        toast.success('Discount removed');
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate values directly to ensure accuracy
            const currentSubtotal = subtotal;
            const currentDiscountAmount = discountAmount;
            const finalTax = storeSettings?.taxEnabled
                ? await calculateTax(currentSubtotal - currentDiscountAmount)
                : 0;

            // Calculate final shipping cost
            const finalShipping = await calculateShipping(
                values.country,
                undefined, // weight
                currentSubtotal - currentDiscountAmount
            );

            // Generate a unique ID for the addresses
            const shippingAddressId = `shipping_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            
            // Prepare billing address - must be defined if included
            let billingAddress;
            if (values.sameAsBilling) {
                billingAddress = {
                    id: `billing_${shippingAddressId}`,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phone: values.phone,
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    postalCode: values.postalCode,
                    country: values.country,
                };
            }
            
            // Prepare discount information - must be defined if included
            let discountInfo = null;
            if (discount) {
                discountInfo = {
                    id: discount.id,
                    code: discount.code,
                    type: discount.type,
                    value: discount.value,
                    amount: currentDiscountAmount,
                };
            }

            // Create order in Firestore
            const orderData = {
                userId: user?.id || 'guest',
                items: items.map((item) => ({
                    productId: item.id,
                    productName: item.name,
                    productImage: item.image || '',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    variantId: item.variant?.id || undefined,
                    variantName: item.variant?.name || undefined,
                })),
                status: 'pending' as const,
                shippingAddress: {
                    id: shippingAddressId,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phone: values.phone,
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    postalCode: values.postalCode,
                    country: values.country,
                },
                billingAddress: billingAddress || undefined,
                discount: discountInfo || undefined,
                paymentMethod: values.paymentMethod,
                subtotal: currentSubtotal,
                discountAmount: currentDiscountAmount,
                shipping: finalShipping,
                tax: finalTax,
                total:
                    currentSubtotal -
                    currentDiscountAmount +
                    finalShipping +
                    finalTax,
                createdAt: new Date().toISOString(), // Use consistent date format
                // Settings info in a format Firestore accepts
                settings: {
                    taxEnabled: storeSettings?.taxEnabled || false,
                    taxRate: storeSettings?.taxRate || 0,
                    currency: storeSettings?.currency || 'USD',
                },
            };

            // Create the order in Firestore
            const orderId = await createOrder(orderData);

            // Clear the cart after successful order
            clearCart();

            // Redirect to success page
            router.push(`/checkout/confirmation?orderId=${orderId}`);

            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (items.length === 0) {
        return (
            <>
                <SiteHeader />
                <main className="container py-20">
                    <div className="text-center space-y-6">
                        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">
                                Your cart is empty
                            </h1>
                            <p className="text-muted-foreground">
                                Looks like you have not added anything to your
                                cart yet.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                </main>
                <SiteFooter />
            </>
        );
    }

    return (
        <>
            <SiteHeader />
            <main className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                {isLoadingSettings ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">
                            Loading checkout information...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column - Checkout Form */}
                        <div>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold">
                                            Shipping Information
                                        </h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            First Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="John"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Last Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Doe"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="john.doe@example.com"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Phone
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="+1 (555) 123-4567"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="123 Main St, Apt 4B"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            City
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="New York"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            State / Province
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="NY"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            ZIP / Postal Code
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="10001"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Country
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select country" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="us">
                                                                    United
                                                                    States
                                                                </SelectItem>
                                                                <SelectItem value="ca">
                                                                    Canada
                                                                </SelectItem>
                                                                <SelectItem value="uk">
                                                                    United
                                                                    Kingdom
                                                                </SelectItem>
                                                                <SelectItem value="au">
                                                                    Australia
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="sameAsBilling"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Billing address is
                                                            the same as shipping
                                                            address
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold">
                                            Payment Method
                                        </h2>
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select payment method" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {paymentSettings?.stripeEnabled && (
                                                                <SelectItem value="card">
                                                                    Credit Card
                                                                </SelectItem>
                                                            )}
                                                            {paymentSettings?.paypalEnabled && (
                                                                <SelectItem value="paypal">
                                                                    PayPal
                                                                </SelectItem>
                                                            )}
                                                            <SelectItem value="applepay">
                                                                Apple Pay
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Credit card form would go here */}
                                        {form.watch('paymentMethod') ===
                                            'card' && (
                                            <div className="mt-4 space-y-4">
                                                <Input placeholder="Card number" />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <Input
                                                        placeholder="MM/YY"
                                                        className="col-span-1"
                                                    />
                                                    <Input
                                                        placeholder="CVC"
                                                        className="col-span-1"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            `Complete Order - ${formatPrice(total)}`
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Order Summary
                                    </h2>
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div
                                                key={`${item.id}-${item.variant?.id || ''}`}
                                                className="flex gap-4"
                                            >
                                                <div className="h-16 w-16 rounded-md bg-secondary relative flex-shrink-0">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h3 className="font-medium">
                                                            {item.name}
                                                        </h3>
                                                        <p className="font-medium">
                                                            {formatPrice(
                                                                item.price *
                                                                    item.quantity
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatPrice(
                                                            item.price
                                                        )}{' '}
                                                        × {item.quantity}
                                                    </div>
                                                    {item.variant && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {item.variant.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Discount Code Input */}
                                    {!discount ? (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium">
                                                Discount Code
                                            </p>
                                            <div className="flex space-x-2">
                                                <Input
                                                    value={discountCode}
                                                    onChange={(e) =>
                                                        setDiscountCode(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter code"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={applyDiscount}
                                                    disabled={
                                                        isApplyingDiscount ||
                                                        !discountCode.trim()
                                                    }
                                                >
                                                    {isApplyingDiscount ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Apply'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 bg-muted p-2 rounded-md flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Discount Applied
                                                </p>
                                                <p className="text-xs">
                                                    {discount.code} -{' '}
                                                    {discount.name}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeDiscount}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}

                                    <Separator className="my-4" />

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>

                                        {discount && discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>
                                                    -
                                                    {formatPrice(
                                                        discountAmount
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center">
                                                Shipping
                                                {shippingSettings && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Method:{' '}
                                                                    {
                                                                        shippingSettings.method
                                                                    }
                                                                </p>
                                                                {shippingSettings.method ===
                                                                    'flat-rate' && (
                                                                    <p>
                                                                        Rate:{' '}
                                                                        {formatPrice(
                                                                            shippingSettings.flatRate
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </span>
                                            <span>
                                                {formatPrice(shippingCost)}
                                            </span>
                                        </div>

                                        {storeSettings?.taxEnabled && (
                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center">
                                                    Tax
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Tax rate:{' '}
                                                                    {
                                                                        storeSettings.taxRate
                                                                    }
                                                                    %
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </span>
                                                <span>{formatPrice(tax)}</span>
                                            </div>
                                        )}

                                        <Separator className="my-2" />

                                        <div className="flex justify-between font-medium text-lg">
                                            <span>Total</span>
                                            <span>{formatPrice(total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col p-6 pt-0 gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/cart">Edit Cart</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
