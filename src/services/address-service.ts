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
import { Address } from '@/types';

const ADDRESS_COLLECTION = 'addresses';

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
    try {
        const addressesRef = collection(firestore, ADDRESS_COLLECTION);
        const q = query(addressesRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const addresses: Address[] = [];
        snapshot.forEach((doc) => {
            addresses.push({ id: doc.id, ...doc.data() } as Address);
        });

        return addresses;
    } catch (error) {
        console.error('Error getting addresses:', error);
        throw error;
    }
}

/**
 * Get a specific address by ID
 */
export async function getAddressById(id: string): Promise<Address | null> {
    try {
        const addressRef = doc(firestore, ADDRESS_COLLECTION, id);
        const snapshot = await getDoc(addressRef);

        if (!snapshot.exists()) {
            return null;
        }

        return { id: snapshot.id, ...snapshot.data() } as Address;
    } catch (error) {
        console.error('Error getting address:', error);
        throw error;
    }
}

/**
 * Add a new address
 */
export async function addAddress(
    userId: string,
    address: Omit<Address, 'id'>
): Promise<string> {
    try {
        const addressesRef = collection(firestore, ADDRESS_COLLECTION);
        const newAddress = {
            ...address,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(addressesRef, newAddress);
        return docRef.id;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
}

/**
 * Update an existing address
 */
export async function updateAddress(
    userId: string,
    addressId: string,
    address: Partial<Address>
): Promise<void> {
    try {
        const addressRef = doc(firestore, ADDRESS_COLLECTION, addressId);
        const snapshot = await getDoc(addressRef);

        if (!snapshot.exists()) {
            throw new Error('Address not found');
        }

        // Verify this address belongs to the user
        const addressData = snapshot.data();
        if (addressData.userId !== userId) {
            throw new Error(
                'Unauthorized: Address does not belong to this user'
            );
        }

        await updateDoc(addressRef, {
            ...address,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
}

/**
 * Delete an address
 */
export async function deleteAddress(
    userId: string,
    addressId: string
): Promise<void> {
    try {
        const addressRef = doc(firestore, ADDRESS_COLLECTION, addressId);
        const snapshot = await getDoc(addressRef);

        if (!snapshot.exists()) {
            throw new Error('Address not found');
        }

        // Verify this address belongs to the user
        const addressData = snapshot.data();
        if (addressData.userId !== userId) {
            throw new Error(
                'Unauthorized: Address does not belong to this user'
            );
        }

        await deleteDoc(addressRef);
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
    userId: string,
    addressId: string
): Promise<void> {
    try {
        // First get all user addresses
        const addresses = await getUserAddresses(userId);

        // Update each address (set isDefault to false for all except the selected one)
        for (const address of addresses) {
            const addressRef = doc(firestore, ADDRESS_COLLECTION, address.id);
            await updateDoc(addressRef, {
                isDefault: address.id === addressId,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
}
