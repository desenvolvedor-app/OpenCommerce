import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
} from 'firebase/firestore';

import { firestore } from '@/lib/firebase/firebase';

export interface Discount {
    id: string;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    active: boolean;
    minimumPurchase?: number;
    usageLimit?: number;
    usageCount?: number;
    expiresAt?: Date;
    createdAt?: any;
    updatedAt?: any;
}

// Validate a discount code
export async function validateDiscount(code: string): Promise<Discount | null> {
    try {
        const q = query(
            collection(firestore, 'discounts'),
            where('code', '==', code.toUpperCase()),
            where('active', '==', true),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const discount = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
        } as Discount;

        // Check if discount has expired
        if (discount.expiresAt && discount.expiresAt < new Date()) {
            return null;
        }

        // Check if discount has reached usage limit
        if (
            discount.usageLimit &&
            discount.usageCount &&
            discount.usageCount >= discount.usageLimit
        ) {
            return null;
        }

        return discount;
    } catch (error) {
        console.error('Error validating discount:', error);
        throw error;
    }
}

// Apply discount to a subtotal
export function applyDiscount(discount: Discount, subtotal: number): number {
    if (!discount.active) {
        return subtotal;
    }

    // Check minimum purchase requirement
    if (discount.minimumPurchase && subtotal < discount.minimumPurchase) {
        return subtotal;
    }

    if (discount.type === 'percentage') {
        const discountAmount = subtotal * (discount.value / 100);
        return subtotal - discountAmount;
    }

    if (discount.type === 'fixed') {
        return Math.max(0, subtotal - discount.value);
    }

    return subtotal;
}

// Get all discounts
export async function getDiscounts(): Promise<Discount[]> {
    try {
        const q = query(collection(firestore, 'discounts'));
        const querySnapshot = await getDocs(q);

        const discounts: Discount[] = [];
        querySnapshot.forEach((doc) => {
            discounts.push({ id: doc.id, ...doc.data() } as Discount);
        });

        return discounts;
    } catch (error) {
        console.error('Error getting discounts:', error);
        throw error;
    }
}

// Get a discount by ID
export async function getDiscountById(id: string): Promise<Discount | null> {
    try {
        const docRef = doc(firestore, 'discounts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Discount;
        }

        return null;
    } catch (error) {
        console.error('Error getting discount by ID:', error);
        throw error;
    }
}
