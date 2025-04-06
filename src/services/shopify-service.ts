import {
    initShopifyClient,
    productToShopifyProduct,
    shopifyCollectionToCategory,
    shopifyProductToProduct,
} from '@/lib/shopify/shopify-adapter';
import { Category, Product } from '@/types';

// Check if Shopify integration is enabled
const isShopifyEnabled = process.env.NEXT_PUBLIC_USE_SHOPIFY === 'true';
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const shopifyAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;

// Initialize Shopify client if enabled
const shopifyClient =
    isShopifyEnabled && shopifyDomain && shopifyAccessToken
        ? initShopifyClient(shopifyDomain, shopifyAccessToken)
        : null;

/**
 * Fetch products from Shopify
 */
export async function getShopifyProducts(): Promise<Product[]> {
    if (!shopifyClient) {
        throw new Error('Shopify client not initialized');
    }

    try {
        const shopifyProducts = await shopifyClient.product.list();
        return shopifyProducts.map(shopifyProductToProduct);
    } catch (error) {
        console.error('Error fetching products from Shopify:', error);
        throw error;
    }
}

/**
 * Create a product in Shopify
 */
export async function createShopifyProduct(product: Product): Promise<Product> {
    if (!shopifyClient) {
        throw new Error('Shopify client not initialized');
    }

    try {
        const shopifyProduct = productToShopifyProduct(product);
        const createdShopifyProduct =
            await shopifyClient.product.create(shopifyProduct);
        return shopifyProductToProduct(createdShopifyProduct);
    } catch (error) {
        console.error('Error creating product in Shopify:', error);
        throw error;
    }
}

/**
 * Fetch categories/collections from Shopify
 */
export async function getShopifyCollections(): Promise<Category[]> {
    if (!shopifyClient) {
        throw new Error('Shopify client not initialized');
    }

    try {
        const shopifyCollections = await shopifyClient.collection.list();
        return shopifyCollections.map(shopifyCollectionToCategory);
    } catch (error) {
        console.error('Error fetching collections from Shopify:', error);
        throw error;
    }
}

/**
 * Check if we're using Shopify as a backend
 */
export function isUsingShopify(): boolean {
    return Boolean(shopifyClient);
}

/**
 * Sync a product between our database and Shopify
 */
export async function syncProductWithShopify(product: Product): Promise<void> {
    if (!shopifyClient) {
        return; // Silently exit if Shopify isn't enabled
    }

    try {
        await createShopifyProduct(product);
    } catch (error) {
        console.error('Error syncing product with Shopify:', error);
        // Don't throw - we don't want to break the main flow if sync fails
    }
}
