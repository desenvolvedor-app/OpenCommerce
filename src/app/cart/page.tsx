'use client';

import { Info, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatPrice } from '@/lib/utils';
import { validateDiscount } from '@/services/discount-service';
import { getStoreSettings } from '@/services/settings-service';
import { useCartStore } from '@/store/cart-store';

export default function CartPage() {
    // Get all relevant cart state using the functions
    const items = useCartStore((state) => state.items);
    const subtotal = useCartStore((state) => state.subtotal());
    const discountAmount = useCartStore((state) => state.discountAmount());
    const tax = useCartStore((state) => state.tax());
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const discount = useCartStore((state) => state.discount);
    const setDiscount = useCartStore((state) => state.setDiscount);
    const setTaxRate = useCartStore((state) => state.setTaxRate);

    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [storeSettings, setStoreSettings] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    // This ensures hydration mismatch is avoided
    useEffect(() => {
        setMounted(true);
    }, [items, subtotal, discount]);

    // Load tax settings
    useEffect(() => {
        async function loadTaxSettings() {
            try {
                const settings = await getStoreSettings();
                setStoreSettings(settings);

                if (settings.taxEnabled) {
                    setTaxRate(settings.taxRate);
                } else {
                    setTaxRate(0);
                }
            } catch (error) {
                console.error('Error loading tax settings:', error);
            } finally {
                setIsLoadingSettings(false);
            }
        }

        if (mounted) {
            loadTaxSettings();
        }
    }, [setTaxRate, mounted]);

    const handleRemoveItem = async (id: string, variantId?: string) => {
        const itemKey = `${id}-${variantId || ''}`;
        setIsRemoving(itemKey);

        // Simulate a small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        removeItem(id, variantId);
        setIsRemoving(null);
    };

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

    const removeDiscount = () => {
        setDiscount(null);
        toast.success('Discount removed');
    };

    // Loading state or no client-side hydration yet
    if (!mounted) {
        return (
            <>
                <SiteHeader />
                <main className="container py-10">
                    <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </main>
                <SiteFooter />
            </>
        );
    }

    // Empty cart state
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
                                Looks like you haven&apos;t added anything to
                                your cart yet.
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
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted p-4 font-medium grid grid-cols-12">
                                <span className="col-span-6">Product</span>
                                <span className="col-span-2 text-center">
                                    Price
                                </span>
                                <span className="col-span-2 text-center">
                                    Quantity
                                </span>
                                <span className="col-span-2 text-center">
                                    Total
                                </span>
                            </div>
                            <div className="divide-y">
                                {items.map((item) => {
                                    const itemKey = `${item.id}-${item.variant?.id || ''}`;
                                    const isItemRemoving =
                                        isRemoving === itemKey;

                                    return (
                                        <div
                                            key={itemKey}
                                            className={`p-4 grid grid-cols-12 items-center ${isItemRemoving ? 'opacity-50' : ''}`}
                                        >
                                            <div className="col-span-6 flex gap-4">
                                                <div className="w-16 h-16 relative bg-secondary rounded">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        {item.name}
                                                    </h3>
                                                    {item.variant && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.variant.name}
                                                        </p>
                                                    )}
                                                    <Button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                                item.variant?.id
                                                            )
                                                        }
                                                        className="text-sm text-red-500 mt-1 inline-flex items-center"
                                                        disabled={
                                                            isItemRemoving
                                                        }
                                                    >
                                                        {isItemRemoving ? (
                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                        )}
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                {formatPrice(item.price)}
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <div className="flex border rounded-md">
                                                    <Button
                                                        className="px-2"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                Math.max(
                                                                    1,
                                                                    item.quantity -
                                                                        1
                                                                ),
                                                                item.variant?.id
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <=
                                                                1 ||
                                                            isItemRemoving
                                                        }
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="px-3 border-x">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        className="px-2"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity +
                                                                    1,
                                                                item.variant?.id
                                                            )
                                                        }
                                                        disabled={
                                                            isItemRemoving
                                                        }
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center font-medium">
                                                {formatPrice(
                                                    item.price * item.quantity
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="border rounded-lg p-6 space-y-6">
                            <h2 className="text-lg font-bold">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                {/* Discount Code Input */}
                                {!discount ? (
                                    <div className="space-y-2">
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
                                                size="sm"
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
                                    <div className="bg-muted p-2 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Discount Applied
                                            </p>
                                            <p className="text-xs">
                                                {discount.code} -{' '}
                                                {discount.type === 'percentage'
                                                    ? `${discount.value}%`
                                                    : formatPrice(
                                                          discount.value
                                                      )}
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

                                {discount && discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>
                                            -{formatPrice(discountAmount)}
                                        </span>
                                    </div>
                                )}

                                {storeSettings?.taxEnabled && (
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center">
                                            Tax
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
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

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Estimated Total</span>
                                    <span>
                                        {formatPrice(
                                            subtotal - discountAmount + tax
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Button className="w-full" asChild>
                                <Link href="/checkout">
                                    Proceed to Checkout
                                </Link>
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <p>or</p>
                                <Link
                                    href="/products"
                                    className="underline underline-offset-2"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
