import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore } from '@/lib/firebase/firebase';
import { getProductById } from '@/services/product-service';
import { Product } from '@/types';

const WISHLIST_COLLECTION = 'wishlists';

/**
 * Get a user's wishlist products
 */
export async function getUserWishlist(userId: string): Promise<Product[]> {
    try {
        // Get the user's wishlist document
        const wishlistRef = doc(firestore, WISHLIST_COLLECTION, userId);
        const wishlistDoc = await getDoc(wishlistRef);

        if (!wishlistDoc.exists()) {
            return [];
        }

        const wishlistData = wishlistDoc.data();
        const productIds = wishlistData.products || [];

        // If no products in wishlist, return empty array
        if (productIds.length === 0) {
            return [];
        }

        // Fetch all products from the wishlist
        const products: Product[] = [];

        // Get products one by one (not the most efficient, but works for moderate lists)
        for (const productId of productIds) {
            try {
                const product = await getProductById(productId);
                if (product) {
                    products.push(product);
                }
            } catch (error) {
                console.error(`Error fetching product ${productId}:`, error);
                // Continue with other products even if one fails
            }
        }

        return products;
    } catch (error) {
        console.error('Error getting wishlist:', error);
        throw error;
    }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(
    userId: string,
    productId: string
): Promise<void> {
    try {
        // Check if product exists
        const product = await getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Get the user's wishlist document
        const wishlistRef = doc(firestore, WISHLIST_COLLECTION, userId);
        const wishlistDoc = await getDoc(wishlistRef);

        if (wishlistDoc.exists()) {
            // Update existing wishlist
            const wishlistData = wishlistDoc.data();
            const products = wishlistData.products || [];

            // Check if product is already in wishlist
            if (!products.includes(productId)) {
                products.push(productId);
                await setDoc(
                    wishlistRef,
                    {
                        userId,
                        products,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }
        } else {
            // Create new wishlist
            await setDoc(wishlistRef, {
                userId,
                products: [productId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
    userId: string,
    productId: string
): Promise<void> {
    try {
        // Get the user's wishlist document
        const wishlistRef = doc(firestore, WISHLIST_COLLECTION, userId);
        const wishlistDoc = await getDoc(wishlistRef);

        if (!wishlistDoc.exists()) {
            return; // Nothing to remove
        }

        // Update wishlist
        const wishlistData = wishlistDoc.data();
        const products = wishlistData.products || [];

        // Remove product from wishlist
        const updatedProducts = products.filter(
            (id: string) => id !== productId
        );

        await setDoc(
            wishlistRef,
            {
                products: updatedProducts,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
    userId: string,
    productId: string
): Promise<boolean> {
    try {
        // Get the user's wishlist document
        const wishlistRef = doc(firestore, WISHLIST_COLLECTION, userId);
        const wishlistDoc = await getDoc(wishlistRef);

        if (!wishlistDoc.exists()) {
            return false;
        }

        const wishlistData = wishlistDoc.data();
        const products = wishlistData.products || [];

        return products.includes(productId);
    } catch (error) {
        console.error('Error checking wishlist:', error);
        throw error;
    }
}
