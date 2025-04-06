'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import { clearAuthCookie, setAuthCookie } from '@/lib/auth-utils';
import { auth, firestore } from '@/lib/firebase/firebase';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);

            try {
                if (firebaseUser) {
                    // Set auth cookie for server components
                    setAuthCookie(firebaseUser.uid);

                    // Get user data from Firestore
                    const userRef = doc(firestore, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        // User exists in Firestore, use that data
                        const userData = userSnap.data() as Omit<User, 'id'>;
                        setUser({
                            id: firebaseUser.uid,
                            ...userData,
                        });
                    } else {
                        // User doesn't exist in Firestore yet, create a new document
                        const newUser: Omit<User, 'id'> = {
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || '',
                            role: 'customer', // Default role
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        };

                        // Save to Firestore
                        await setDoc(userRef, newUser);

                        // Update state
                        setUser({
                            id: firebaseUser.uid,
                            ...newUser,
                        });
                    }
                } else {
                    setUser(null);
                    clearAuthCookie();
                }
            } catch (error) {
                console.error('Error in auth state change handler:', error);
                setUser(null);
                clearAuthCookie();
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
