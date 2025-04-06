import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword,
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { auth, firestore } from '@/lib/firebase/firebase';
import { User } from '@/types';

const USER_COLLECTION = 'users';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const userRef = doc(firestore, USER_COLLECTION, userId);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return null;
        }

        return { id: snapshot.id, ...snapshot.data() } as User;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    profileData: Partial<Pick<User, 'name'>>
): Promise<void> {
    try {
        const userRef = doc(firestore, USER_COLLECTION, userId);

        await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Update user email
 * Requires re-authentication for security
 */
export async function updateUserEmail(
    newEmail: string,
    password: string
): Promise<void> {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Not authenticated');
        }

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);

        // Update email in Firebase Auth
        await updateEmail(user, newEmail);

        // Update email in Firestore
        const userRef = doc(firestore, USER_COLLECTION, user.uid);
        await updateDoc(userRef, {
            email: newEmail,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating email:', error);
        throw error;
    }
}

/**
 * Update user password
 * Requires re-authentication for security
 */
export async function updateUserPassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Not authenticated');
        }

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(
            user.email!,
            currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Update password in Firebase Auth
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const q = query(
            collection(firestore, USER_COLLECTION),
            where('email', '==', email),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as User;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

export async function updateUser(
    id: string,
    userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    try {
        const userRef = doc(firestore, USER_COLLECTION, id);
        await updateDoc(userRef, {
            ...userData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function getAllUsers() {
    try {
        const q = query(
            collection(firestore, USER_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const users: User[] = [];

        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });

        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

export async function getRecentUsers(limitCount = 5) {
    try {
        const q = query(
            collection(firestore, USER_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const users: User[] = [];

        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });

        return users;
    } catch (error) {
        console.error('Error getting recent users:', error);
        throw error;
    }
}

export async function getUserStats() {
    try {
        const allUsers = await getAllUsers();

        const total = allUsers.length;
        const admins = allUsers.filter((user) => user.role === 'admin').length;
        const customers = allUsers.filter(
            (user) => user.role === 'customer'
        ).length;

        // Get users created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = allUsers.filter((user) => {
            const createdAt = user.createdAt?.toDate
                ? user.createdAt.toDate()
                : new Date(user.createdAt);
            return createdAt > thirtyDaysAgo;
        }).length;

        return {
            total,
            admins,
            customers,
            newUsers,
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}
