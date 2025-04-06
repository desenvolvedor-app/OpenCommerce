'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { createOrder } from '@/services/order-service';
import { useCartStore } from '@/store/cart-store';

export function CheckoutForm() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, subtotal, clearCart } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);

    // Shipping information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    // Payment information
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsLoading(true);

        try {
            // In a real implementation, this would integrate with a payment gateway
            // Here we're just simulating the order creation
            const orderData = {
                userId: user?.id || 'guest',
                items: items.map((item) => ({
                    productId: item.id,
                    productName: item.name,
                    productImage: item.image || '',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    variantId: item.variant?.id,
                    variantName: item.variant?.name,
                })),
                shippingAddress: {
                    id: 'address_1', 
                    firstName,
                    lastName,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    postalCode,
                    country,
                },
                subtotal: subtotal(), // ✅ invoke the function
                tax: subtotal() * 0.1,
                shippingCost: 10,
                total: subtotal() + subtotal() * 0.1 + 10,
                paymentMethod: 'credit_card',
                status: "pending" as const,
                shipping: 0,
                createdAt: new Date().toISOString(),
            };                      

            const orderId = await createOrder(orderData);

            // Clear the cart after successful order
            clearCart();

            // Navigate to order confirmation
            router.push(`/checkout/confirmation?orderId=${orderId}`);
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('An error occurred during checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                            id="postalCode"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <Tabs defaultValue="card">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="paypal" disabled>
                            PayPal
                        </TabsTrigger>
                        <TabsTrigger value="apple" disabled>
                            Apple Pay
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                                id="cardNumber"
                                placeholder="•••• •••• •••• ••••"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                                id="cardName"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                    id="expiryDate"
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={(e) =>
                                        setExpiryDate(e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="•••"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Button
                className="w-full"
                disabled={isLoading || items.length === 0}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Complete Order'
                )}
            </Button>
        </form>
    );
}
