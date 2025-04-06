import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { clearAuthCookie, setAuthCookie } from '@/lib/auth-utils';
import { User } from '@/types';

import { auth, firestore } from './firebase';

// Export auth for use in other files
export { auth };

export async function signIn(email: string, password: string): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    const user = userCredential.user;

    // Set auth cookie for server-side auth
    setAuthCookie(user.uid);
}

export async function signUp(
    email: string,
    password: string,
    name: string
): Promise<void> {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        name: name,
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Set auth cookie for server-side auth
    setAuthCookie(user.uid);
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);

    // Clear auth cookie
    clearAuthCookie();
    // Optionally clear local storage or other client-side state
    window.location.href = '/'; // Force a full page refresh to clear all component states
}

export async function resetPassword(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            return userData.role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Update a specific user to admin role (for testing purposes)
export async function makeUserAdmin(userId: string): Promise<void> {
    try {
        const userRef = doc(firestore, 'users', userId);
        await setDoc(
            userRef,
            { role: 'admin', updatedAt: serverTimestamp() },
            { merge: true }
        );
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}
