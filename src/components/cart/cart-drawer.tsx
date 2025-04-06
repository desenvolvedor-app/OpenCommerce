'use client';

import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem } = useCartStore();
    // Access subtotal correctly using the function
    const subtotal = useCartStore((state) => state.subtotal());
    const [removingItem, setRemovingItem] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // This ensures hydration mismatch is avoided
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRemoveItem = async (id: string, variantId?: string) => {
        const itemKey = `${id}-${variantId || ''}`;
        setRemovingItem(itemKey);

        // Add a small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        removeItem(id, variantId);
        setRemovingItem(null);
    };

    // Only render cart contents after client-side hydration
    if (!mounted) {
        return (
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent className="flex flex-col w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Your Cart
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="flex flex-col w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Your Cart {mounted && `(${items.length})`}
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">
                            Your cart is empty
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Add some items to get started
                        </p>
                        <Button onClick={onClose}>Continue Shopping</Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-6">
                            <ul className="divide-y">
                                {items.map((item) => {
                                    const itemKey = `${item.id}-${item.variant?.id || ''}`;
                                    const isRemoving = removingItem === itemKey;

                                    return (
                                        <li
                                            key={itemKey}
                                            className={`py-4 flex gap-4 ${isRemoving ? 'opacity-50' : ''}`}
                                        >
                                            <div className="w-20 h-20 relative bg-secondary rounded">
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
                                                <h4 className="font-medium">
                                                    {item.name}
                                                </h4>
                                                {item.variant && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.variant.name}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center border rounded-md">
                                                        <Button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    Math.max(
                                                                        1,
                                                                        item.quantity -
                                                                            1
                                                                    ),
                                                                    item.variant
                                                                        ?.id
                                                                )
                                                            }
                                                            className="p-1 disabled:opacity-50"
                                                            disabled={
                                                                item.quantity <=
                                                                    1 ||
                                                                isRemoving
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="px-2 text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                    item.variant
                                                                        ?.id
                                                                )
                                                            }
                                                            className="p-1"
                                                            disabled={
                                                                isRemoving
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                                item.variant?.id
                                                            )
                                                        }
                                                        className="text-sm text-red-500 hover:text-red-600"
                                                        disabled={isRemoving}
                                                    >
                                                        {isRemoving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="text-right mt-1">
                                                    <span className="font-medium">
                                                        {formatPrice(
                                                            item.price *
                                                                item.quantity
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                                <span>Subtotal</span>
                                <span className="font-medium">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Shipping and taxes calculated at checkout
                            </p>
                            <div className="space-y-3">
                                <Button asChild className="w-full" size="lg">
                                    <Link href="/checkout" onClick={onClose}>
                                        Checkout
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={onClose}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
