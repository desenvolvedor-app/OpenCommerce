import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Discount } from '@/services/discount-service';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
        id: string;
        name: string;
    };
}

interface CartState {
    items: CartItem[];
    discount: Discount | null;
    shippingCost: number;
    taxRate: number;
    addItem: (item: CartItem) => void;
    updateQuantity: (id: string, quantity: number, variantId?: string) => void;
    removeItem: (id: string, variantId?: string) => void;
    clearCart: () => void;
    setDiscount: (discount: Discount | null) => void;
    setShippingCost: (cost: number) => void;
    setTaxRate: (rate: number) => void;

    // Calculated properties accessed as functions for consistency
    subtotal: () => number;
    discountAmount: () => number;
    tax: () => number;
    total: () => number;
    count: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            discount: null,
            shippingCost: 0,
            taxRate: 0,

            // Add item to cart
            addItem: (item) =>
                set((state) => {
                    // Check if item already exists in cart
                    const existingItemIndex = state.items.findIndex(
                        (cartItem) =>
                            cartItem.id === item.id &&
                            (!cartItem.variant ||
                                !item.variant ||
                                cartItem.variant.id === item.variant.id)
                    );

                    if (existingItemIndex !== -1) {
                        // Update quantity if item exists
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex].quantity +=
                            item.quantity;
                        return { items: updatedItems };
                    }

                    // Add new item if it doesn't exist
                    return { items: [...state.items, item] };
                }),

            // Update item quantity
            updateQuantity: (id, quantity, variantId) =>
                set((state) => {
                    return {
                        items: state.items.map((item) => {
                            if (
                                item.id === id &&
                                (!item.variant ||
                                    !variantId ||
                                    item.variant.id === variantId)
                            ) {
                                return { ...item, quantity };
                            }
                            return item;
                        }),
                    };
                }),

            // Remove item from cart
            removeItem: (id, variantId) =>
                set((state) => {
                    return {
                        items: state.items.filter(
                            (item) =>
                                item.id !== id ||
                                (item.variant &&
                                    variantId &&
                                    item.variant.id !== variantId)
                        ),
                    };
                }),

            // Clear cart
            clearCart: () =>
                set({
                    items: [],
                    discount: null,
                    shippingCost: 0,
                }),

            // Set discount
            setDiscount: (discount) => set({ discount }),

            // Set shipping cost
            setShippingCost: (cost) => set({ shippingCost: cost }),

            // Set tax rate
            setTaxRate: (rate) => set({ taxRate: rate }),

            // Calculated values as functions
            subtotal: () => {
                const { items } = get();
                return items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
            },

            discountAmount: () => {
                const { discount } = get();
                const subtotalValue = get().subtotal();

                if (!discount || !discount.active) return 0;

                if (
                    discount.minimumPurchase &&
                    subtotalValue < discount.minimumPurchase
                ) {
                    return 0;
                }

                if (discount.type === 'percentage') {
                    return subtotalValue * (discount.value / 100);
                }

                if (discount.type === 'fixed') {
                    return Math.min(discount.value, subtotalValue);
                }

                return 0;
            },

            tax: () => {
                const subtotalValue = get().subtotal();
                const discountAmountValue = get().discountAmount();
                const { taxRate } = get();

                return (subtotalValue - discountAmountValue) * (taxRate / 100);
            },

            total: () => {
                const subtotalValue = get().subtotal();
                const discountAmountValue = get().discountAmount();
                const taxValue = get().tax();
                const { shippingCost } = get();

                return (
                    subtotalValue -
                    discountAmountValue +
                    taxValue +
                    shippingCost
                );
            },

            count: () => {
                const { items } = get();
                return items.reduce((acc, item) => acc + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
                discount: state.discount,
                shippingCost: state.shippingCost,
                taxRate: state.taxRate,
            }),
        }
    )
);
