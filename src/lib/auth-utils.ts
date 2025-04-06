import { doc, getDoc } from 'firebase/firestore';

import { auth, firestore } from '@/lib/firebase/firebase';
import { User } from '@/types';

/**
 * Get the current user from cookies on the client side
 */
export async function getUserFromCookies(): Promise<User | null> {
    try {
        // Get the current Firebase user
        const currentUser = auth.currentUser;

        if (!currentUser) {
            return null;
        }

        // Get the complete user data from Firestore
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return null;
        }

        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        console.error('Error getting user from cookies:', error);
        return null;
    }
}

/**
 * Set auth cookie for client-side auth persistence
 */
export function setAuthCookie(userId: string): void {
    // Create a cookie with 14 days expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + 14);

    document.cookie = `session=${userId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Clear the auth cookie
 */
export function clearAuthCookie(): void {
    document.cookie = 'session=; path=/; max-age=0; SameSite=Lax';
}

/**
 * Parse userId from cookie (client-side)
 */
export function getUserIdFromCookie(): string | null {
    const cookies = document.cookie.split('; ');
    const sessionCookie = cookies.find((c) => c.startsWith('session='));

    if (!sessionCookie) {
        return null;
    }

    return sessionCookie.split('=')[1];
}
