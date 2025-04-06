import {
    addDoc,
    collection,
    deleteDoc,
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
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from 'firebase/storage';

import { firestore, storage } from '@/lib/firebase/firebase';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { generateSlug } from '@/lib/utils';
import { Category } from '@/types';

const CATEGORY_COLLECTION = 'categories';

// Get all categories
export async function getCategories() {
    try {
        const q = query(
            collection(firestore, CATEGORY_COLLECTION),
            orderBy('name', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const categories: Category[] = [];

        querySnapshot.forEach((doc) => {
            categories.push(
                sanitizeFirestoreData({ id: doc.id, ...doc.data() }) as Category
            );
        });

        return categories;
    } catch (error) {
        console.error('Error getting categories:', error);
        return []; // Return empty array instead of throwing error for better UX
    }
}

// Get featured categories
export async function getFeaturedCategories(limitCount = 4) {
    try {
        const q = query(
            collection(firestore, CATEGORY_COLLECTION),
            where('featured', '==', true),
            orderBy('name', 'asc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const categories: Category[] = [];

        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() } as Category);
        });

        return categories;
    } catch (error) {
        console.error('Error getting featured categories:', error);
        return []; // Return empty array instead of throwing
    }
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
    try {
        const docRef = doc(firestore, CATEGORY_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting category by ID:', error);
        throw error;
    }
}

// Get category by slug
export async function getCategoryBySlug(
    slug: string
): Promise<Category | null> {
    try {
        const q = query(
            collection(firestore, CATEGORY_COLLECTION),
            where('slug', '==', slug),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return sanitizeFirestoreData({
                id: doc.id,
                ...doc.data(),
            }) as Category;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting category by slug:', error);
        throw error;
    }
}

// Add a new category
export async function addCategory(
    category: Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
    imageFile?: File
): Promise<string> {
    try {
        // Generate slug from category name
        const slug = generateSlug(category.name);

        // Upload image if provided
        let imageUrl = '';

        if (imageFile) {
            const imageRef = ref(
                storage,
                `categories/${Date.now()}-${imageFile.name}`
            );
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Add document to Firestore
        const docRef = await addDoc(
            collection(firestore, CATEGORY_COLLECTION),
            {
                ...category,
                image: imageUrl || category.image || '',
                slug,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
        );

        return docRef.id;
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
}

// Update an existing category
export async function updateCategory(
    id: string,
    category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>,
    imageFile?: File
): Promise<void> {
    try {
        const docRef = doc(firestore, CATEGORY_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Category not found');
        }

        const currentCategory = docSnap.data() as Omit<Category, 'id'>;

        // Update slug if name is being updated
        let slug = currentCategory.slug;
        if (category.name && category.name !== currentCategory.name) {
            slug = generateSlug(category.name);
        }

        // Handle image upload if provided
        let imageUrl = currentCategory.image || '';

        if (imageFile) {
            // Delete old image if exists
            if (imageUrl) {
                try {
                    // Extract the path from the URL
                    const urlPath = decodeURIComponent(
                        imageUrl.split('/o/')[1].split('?')[0]
                    );
                    const oldImageRef = ref(storage, urlPath);
                    await deleteObject(oldImageRef);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                    // Continue even if deletion fails
                }
            }

            // Upload new image
            const imageRef = ref(
                storage,
                `categories/${Date.now()}-${imageFile.name}`
            );
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Update document in Firestore
        await updateDoc(docRef, {
            ...category,
            slug,
            image: imageUrl,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
    try {
        const docRef = doc(firestore, CATEGORY_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Category not found');
        }

        const category = docSnap.data() as Category;

        // Delete associated image from storage
        if (category.image) {
            try {
                // Extract the path from the URL
                const urlPath = decodeURIComponent(
                    category.image.split('/o/')[1].split('?')[0]
                );
                const imageRef = ref(storage, urlPath);
                await deleteObject(imageRef);
            } catch (error) {
                console.error('Error deleting image:', error);
                // Continue even if deletion fails
            }
        }

        // Delete document from Firestore
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}
