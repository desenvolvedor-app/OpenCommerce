'use client';

import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface CartSheetProps {
    setIsOpen: (open: boolean) => void;
}

export function CartSheet({ setIsOpen }: CartSheetProps) {
    const { items, subtotal, updateQuantity, removeItem } = useCartStore();

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="px-1">
                <SheetTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Your Cart
                </SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                        <h3 className="text-lg font-medium">
                            Your cart is empty
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add items to your cart to checkout
                        </p>
                    </div>
                    <Button onClick={() => setIsOpen(false)}>
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto py-6">
                        <ul className="divide-y">
                            {items.map((item) => (
                                <li
                                    key={`${item.id}-${item.variant}`}
                                    className="py-4"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-secondary">
                                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">
                                                {item.name}
                                            </h4>
                                            {item.variant && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {typeof item.variant === 'string' ? item.variant : item.variant.name}
                                                </p>
                                            )}
                                            <div className="mt-1 flex items-center text-sm">
                                                <p className="text-xs font-medium">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center rounded-md border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-r-none"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            Math.max(1, item.quantity - 1),
                                                            typeof item.variant === 'string' ? item.variant : item.variant?.id
                                                          )
                                                    }
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                    <span className="sr-only">
                                                        Decrease quantity
                                                    </span>
                                                </Button>
                                                <span className="w-8 text-center text-xs">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-l-none"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            Math.max(1, item.quantity - 1),
                                                            typeof item.variant === 'string' ? item.variant : item.variant?.id
                                                          )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    <span className="sr-only">
                                                        Increase quantity
                                                    </span>
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id,
                                                        typeof item.variant === 'string' ? item.variant : item.variant?.id
                                                      )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Remove item
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4 border-t py-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatPrice(Number(subtotal))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Tax
                                </span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatPrice(Number(subtotal))}</span>
                            </div>
                        </div>
                        <SheetFooter className="flex flex-col gap-2">
                            <Button
                                className="w-full"
                                asChild
                                onClick={() => setIsOpen(false)}
                            >
                                <Link href="/checkout">Checkout</Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Continue Shopping
                            </Button>
                        </SheetFooter>
                    </div>
                </>
            )}
        </div>
    );
}
