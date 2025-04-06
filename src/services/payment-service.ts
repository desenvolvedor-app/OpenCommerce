import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { firestore } from '@/lib/firebase/firebase';

export interface PaymentMethod {
    id: string;
    userId: string;
    cardNumber: string; // Last 4 digits only
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
    createdAt?: any;
    updatedAt?: any;
}

const PAYMENT_COLLECTION = 'payment_methods';

/**
 * Get all payment methods for a user
 */
export async function getUserPaymentMethods(
    userId: string
): Promise<PaymentMethod[]> {
    try {
        const paymentRef = collection(firestore, PAYMENT_COLLECTION);
        const q = query(paymentRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const methods: PaymentMethod[] = [];
        snapshot.forEach((doc) => {
            methods.push({ id: doc.id, ...doc.data() } as PaymentMethod);
        });

        return methods;
    } catch (error) {
        console.error('Error getting payment methods:', error);
        throw error;
    }
}

/**
 * Add a new payment method
 * Note: In a real app, this would integrate with a payment processor like Stripe
 */
export async function addPaymentMethod(
    userId: string,
    paymentDetails: Omit<
        PaymentMethod,
        'id' | 'userId' | 'createdAt' | 'updatedAt'
    >
): Promise<string> {
    try {
        // In a real implementation, you would:
        // 1. Use Stripe or another payment processor to securely handle the card
        // 2. Store only the token and last 4 digits in your database

        const methodsRef = collection(firestore, PAYMENT_COLLECTION);
        const newMethod = {
            ...paymentDetails,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(methodsRef, newMethod);

        // If this is the first payment method, make it default
        const methods = await getUserPaymentMethods(userId);
        if (methods.length === 1) {
            await updateDoc(docRef, { isDefault: true });
        }

        return docRef.id;
    } catch (error) {
        console.error('Error adding payment method:', error);
        throw error;
    }
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
    userId: string,
    methodId: string
): Promise<void> {
    try {
        const methodRef = doc(firestore, PAYMENT_COLLECTION, methodId);
        const snapshot = await getDoc(methodRef);

        if (!snapshot.exists()) {
            throw new Error('Payment method not found');
        }

        // Verify this payment method belongs to the user
        const methodData = snapshot.data();
        if (methodData.userId !== userId) {
            throw new Error(
                'Unauthorized: Payment method does not belong to this user'
            );
        }

        // Check if this is the default method
        const isDefault = methodData.isDefault;

        await deleteDoc(methodRef);

        // If it was the default, set another method as default if available
        if (isDefault) {
            const methods = await getUserPaymentMethods(userId);
            if (methods.length > 0) {
                const newDefaultRef = doc(
                    firestore,
                    PAYMENT_COLLECTION,
                    methods[0].id
                );
                await updateDoc(newDefaultRef, {
                    isDefault: true,
                    updatedAt: serverTimestamp(),
                });
            }
        }
    } catch (error) {
        console.error('Error removing payment method:', error);
        throw error;
    }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(
    userId: string,
    methodId: string
): Promise<void> {
    try {
        // First get all user payment methods
        const methods = await getUserPaymentMethods(userId);

        // Verify the method exists and belongs to the user
        const targetMethod = methods.find((method) => method.id === methodId);
        if (!targetMethod) {
            throw new Error(
                'Payment method not found or does not belong to this user'
            );
        }

        // Update each method (set isDefault to false for all except the selected one)
        for (const method of methods) {
            const methodRef = doc(firestore, PAYMENT_COLLECTION, method.id);
            await updateDoc(methodRef, {
                isDefault: method.id === methodId,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error setting default payment method:', error);
        throw error;
    }
}
