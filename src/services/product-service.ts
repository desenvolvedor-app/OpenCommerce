import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    Query,
    serverTimestamp,
    setDoc,
    startAfter,
    updateDoc,
    where,
} from 'firebase/firestore';
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from 'firebase/storage';

import { firestore, storage } from '@/lib/firebase/firebase';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { generateSlug } from '@/lib/utils';
import { Product } from '@/types';

const PRODUCT_COLLECTION = 'products';

// Get products with various filtering options
export async function getProducts(
    options: {
        category?: string;
        featured?: boolean;
        limit?: number;
        lastVisible?: any;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}
) {
    try {
        let q: Query<DocumentData> = collection(firestore, PRODUCT_COLLECTION);

        // Build query
        const constraints = [];

        if (options.category) {
            constraints.push(where('category', '==', options.category));
        }

        if (options.featured !== undefined) {
            constraints.push(where('featured', '==', options.featured));
        }

        const sortField = options.sortBy || 'createdAt';
        const sortDirection = options.sortOrder || 'desc';
        constraints.push(orderBy(sortField, sortDirection));

        if (options.limit) {
            constraints.push(limit(options.limit));
        }

        if (options.lastVisible) {
            constraints.push(startAfter(options.lastVisible));
        }

        q = query(q, ...constraints);

        const querySnapshot = await getDocs(q);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            // Sanitize each product before adding to array
            products.push(
                sanitizeFirestoreData({ id: doc.id, ...doc.data() }) as Product
            );
        });

        // If no products are found, check if we need defaults
        if (
            products.length === 0 &&
            !options.category &&
            !options.lastVisible
        ) {
            // Only create defaults if this is the initial query
            const defaultProducts = await createDefaultProductsIfEmpty();
            if (defaultProducts.length > 0) {
                return {
                    products: defaultProducts.slice(
                        0,
                        options.limit || defaultProducts.length
                    ),
                    lastVisible: null,
                };
            }
        }

        return { products, lastVisible };
    } catch (error) {
        console.error('Error getting products:', error);
        return { products: [], lastVisible: null };
    }
}

// Helper function to create default products if empty
async function createDefaultProductsIfEmpty(): Promise<Product[]> {
    try {
        // Check if any products exist
        const checkQuery = query(
            collection(firestore, PRODUCT_COLLECTION),
            limit(1)
        );
        const checkSnapshot = await getDocs(checkQuery);

        if (!checkSnapshot.empty) {
            return []; // Products exist, don't create defaults
        }

        // Default products
        const defaultProducts: Omit<
            Product,
            'id' | 'createdAt' | 'updatedAt'
        >[] = [
            {
                name: 'Smartphone Pro Max',
                description:
                    'Latest flagship smartphone with advanced camera system, powerful processor, and stunning display.',
                price: 999.99,
                images: ['https://picsum.photos/seed/phone1/500/500'],
                category: 'electronics',
                sku: 'PHONE-001',
                stock: 15,
                featured: true,
                slug: 'smartphone-pro-max',
            },
            {
                name: 'Wireless Noise-Cancelling Headphones',
                description:
                    'Premium wireless headphones with active noise cancellation and all-day battery life.',
                price: 249.99,
                images: ['https://picsum.photos/seed/headphones/500/500'],
                category: 'electronics',
                sku: 'AUDIO-002',
                stock: 8,
                featured: true,
                slug: 'wireless-noise-cancelling-headphones',
            },
            {
                name: 'Smart Fitness Watch',
                description:
                    'Track your fitness goals, heart rate, sleep patterns, and more with this advanced smart watch.',
                price: 199.99,
                images: ['https://picsum.photos/seed/watch/500/500'],
                category: 'electronics',
                sku: 'WEARABLE-003',
                stock: 12,
                featured: true,
                slug: 'smart-fitness-watch',
            },
            {
                name: 'Premium Cotton T-Shirt',
                description:
                    'Ultra-soft premium cotton t-shirt in a modern fit.',
                price: 29.99,
                images: ['https://picsum.photos/seed/tshirt/500/500'],
                category: 'clothing',
                sku: 'APPAREL-004',
                stock: 50,
                featured: false,
                slug: 'premium-cotton-t-shirt',
            },
            {
                name: 'Designer Leather Wallet',
                description:
                    'Handcrafted genuine leather wallet with multiple card slots and RFID protection.',
                price: 49.99,
                images: ['https://picsum.photos/seed/wallet/500/500'],
                category: 'accessories',
                sku: 'ACC-005',
                stock: 20,
                featured: true,
                slug: 'designer-leather-wallet',
            },
            {
                name: 'Stainless Steel Water Bottle',
                description:
                    'Double-walled insulated water bottle that keeps beverages cold for 24 hours or hot for 12 hours.',
                price: 34.99,
                images: ['https://picsum.photos/seed/bottle/500/500'],
                category: 'home',
                sku: 'HOME-006',
                stock: 35,
                featured: false,
                slug: 'stainless-steel-water-bottle',
            },
            {
                name: 'Organic Face Moisturizer',
                description:
                    'All-natural moisturizer made with organic ingredients for all skin types.',
                price: 24.99,
                images: ['https://picsum.photos/seed/moisturizer/500/500'],
                category: 'beauty',
                sku: 'BEAUTY-007',
                stock: 18,
                featured: true,
                slug: 'organic-face-moisturizer',
            },
            {
                name: 'Professional Chef Knife',
                description:
                    'High-carbon stainless steel chef knife with ergonomic handle for professional cooking.',
                price: 79.99,
                images: ['https://picsum.photos/seed/knife/500/500'],
                category: 'home',
                sku: 'KITCHEN-008',
                stock: 10,
                featured: true,
                slug: 'professional-chef-knife',
            },
        ];

        // Add default products to Firestore
        const createdProducts: Product[] = [];

        for (const product of defaultProducts) {
            const productId = generateProductId(product.name);
            await setDoc(doc(firestore, PRODUCT_COLLECTION, productId), {
                ...product,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            createdProducts.push({
                ...product,
                id: productId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return createdProducts;
    } catch (error) {
        console.error('Error creating default products:', error);
        return [];
    }
}

// Helper function to generate consistent IDs for default products
function generateProductId(name: string): string {
    return (
        name.toLowerCase().replace(/[^a-z0-9]/g, '-') +
        '-' +
        Date.now().toString(36)
    );
}

// Get a product by ID
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docRef = doc(firestore, PRODUCT_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Sanitize the Firestore data before returning it
            return sanitizeFirestoreData({
                id: docSnap.id,
                ...docSnap.data(),
            }) as Product;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting product by ID:', error);
        throw error;
    }
}

// Get a product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const q = query(
            collection(firestore, PRODUCT_COLLECTION),
            where('slug', '==', slug),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            // Sanitize the Firestore data before returning it
            return sanitizeFirestoreData({
                id: doc.id,
                ...doc.data(),
            }) as Product;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting product by slug:', error);
        throw error;
    }
}

// Add a new product
export async function addProduct(
    product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
    imageFiles?: File[]
): Promise<string> {
    try {
        // Generate slug from product name
        const slug = generateSlug(product.name);

        // Upload images if provided
        const imageUrls: string[] = [];

        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageRef = ref(
                    storage,
                    `products/${Date.now()}-${file.name}`
                );
                const snapshot = await uploadBytes(imageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(downloadUrl);
            }
        }

        // Add document to Firestore
        const docRef = await addDoc(collection(firestore, PRODUCT_COLLECTION), {
            ...product,
            images: imageUrls.length > 0 ? imageUrls : product.images || [],
            slug,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

// Update an existing product
export async function updateProduct(
    id: string,
    product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
    imageFiles?: File[],
    deleteImages?: string[]
): Promise<void> {
    try {
        const docRef = doc(firestore, PRODUCT_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Product not found');
        }

        const currentProduct = docSnap.data() as Omit<Product, 'id'>;

        // Update slug if name is being updated
        let slug = currentProduct.slug;
        if (product.name && product.name !== currentProduct.name) {
            slug = generateSlug(product.name);
        }

        // Handle image uploads and deletions
        let images = currentProduct.images || [];

        // Delete images if specified
        if (deleteImages && deleteImages.length > 0) {
            // Remove from storage
            for (const imageUrl of deleteImages) {
                try {
                    // Extract the path from the URL
                    const urlPath = decodeURIComponent(
                        imageUrl.split('/o/')[1].split('?')[0]
                    );
                    const imageRef = ref(storage, urlPath);
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Error deleting image:', error);
                    // Continue even if deletion fails
                }
            }

            // Remove from images array
            images = images.filter((url) => !deleteImages.includes(url));
        }

        // Upload new images if provided
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageRef = ref(
                    storage,
                    `products/${Date.now()}-${file.name}`
                );
                const snapshot = await uploadBytes(imageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                images.push(downloadUrl);
            }
        }

        // Update document in Firestore
        await updateDoc(docRef, {
            ...product,
            slug,
            images,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
    try {
        const docRef = doc(firestore, PRODUCT_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Product not found');
        }

        const product = docSnap.data() as Product;

        // Delete associated images from storage
        if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                try {
                    // Extract the path from the URL
                    const urlPath = decodeURIComponent(
                        imageUrl.split('/o/')[1].split('?')[0]
                    );
                    const imageRef = ref(storage, urlPath);
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Error deleting image:', error);
                    // Continue even if deletion fails
                }
            }
        }

        // Delete document from Firestore
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Get products by category
export async function getCategoryProducts(category: string, limitCount = 10) {
    try {
        const q = query(
            collection(firestore, PRODUCT_COLLECTION),
            where('category', '==', category),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error('Error getting category products:', error);
        throw error;
    }
}

// Get featured products
export async function getFeaturedProducts(limitCount = 4) {
    try {
        const q = query(
            collection(firestore, PRODUCT_COLLECTION),
            where('featured', '==', true),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        // If no featured products, create defaults or return all products
        if (products.length === 0) {
            const { products: allProducts } = await getProducts({
                limit: limitCount,
            });
            if (allProducts.length > 0) {
                return allProducts;
            }

            // Create defaults if still no products found
            const defaultProducts = await createDefaultProductsIfEmpty();
            return defaultProducts
                .filter((p) => p.featured)
                .slice(0, limitCount);
        }

        return products;
    } catch (error) {
        console.error('Error getting featured products:', error);
        // Return empty array instead of throwing
        return [];
    }
}
