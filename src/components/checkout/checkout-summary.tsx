'use client';

import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

export function CheckoutSummary() {
    const { items, subtotal } = useCartStore();

    // Sample values for shipping and tax
    const shipping = 10;
    const taxRate = 0.1; // 10%
    const tax = Number(subtotal) * taxRate;
    const total = Number(subtotal) + shipping + tax;

    return (
        <div className="space-y-6 border rounded-lg p-6">
            <h2 className="text-xl font-semibold border-b pb-3">
                Order Summary
            </h2>

            {items.length === 0 ? (
                <div className="py-8 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                        Your cart is empty
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <ul className="divide-y">
                        {items.map((item) => (
                            <li
                                key={`${item.id}-${item.variant?.id || ''}`}
                                className="py-3 flex gap-4"
                            >
                                <div className="w-16 h-16 relative bg-secondary rounded">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    {item.variant && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.variant.name}
                                        </p>
                                    )}
                                    <div className="flex justify-between mt-1">
                                        <p className="text-sm">
                                            {formatPrice(item.price)} ×{' '}
                                            {item.quantity}
                                        </p>
                                        <p className="font-medium">
                                            {formatPrice(
                                                item.price * item.quantity
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatPrice(Number(subtotal))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>{formatPrice(shipping)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-lg pt-4 border-t">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
