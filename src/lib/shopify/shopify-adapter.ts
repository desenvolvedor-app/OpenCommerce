/**
 * Shopify Adapter
 *
 * This module provides compatibility between our internal data models and Shopify's API.
 * It allows for:
 * 1. Using Shopify as a data source (read operations)
 * 2. Syncing data to Shopify (write operations)
 * 3. Migrating from Shopify to our platform
 */

import { Category, Product } from '@/types';

// Type definitions that match Shopify's schema
export interface ShopifyProduct {
    id: string;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    handle: string;
    variants: ShopifyVariant[];
    images: ShopifyImage[];
    tags: string;
    status: string;
    published_at: string;
    created_at: string;
    updated_at: string;
}

export interface ShopifyVariant {
    id: string;
    product_id: string;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_quantity: number;
    requires_shipping: boolean;
    taxable: boolean;
    weight: number;
    weight_unit: string;
    inventory_management: string;
    inventory_policy: string;
    barcode: string;
    created_at: string;
    updated_at: string;
}

export interface ShopifyImage {
    id: string;
    product_id: string;
    position: number;
    src: string;
    alt: string;
    created_at: string;
    updated_at: string;
}

export interface ShopifyCollection {
    id: string;
    title: string;
    body_html: string;
    handle: string;
    published_at: string;
    created_at: string;
    updated_at: string;
}

// Converter functions to transform between our models and Shopify models

/**
 * Convert a Shopify product to our internal Product model
 */
export function shopifyProductToProduct(
    shopifyProduct: ShopifyProduct
): Product {
    const mainVariant = shopifyProduct.variants[0] || {};
    return {
        id: shopifyProduct.id,
        name: shopifyProduct.title,
        description: shopifyProduct.body_html,
        price: parseFloat(mainVariant.price) || 0,
        images: shopifyProduct.images.map((img) => img.src),
        category: shopifyProduct.product_type,
        sku: mainVariant.sku || '',
        stock: mainVariant.inventory_quantity || 0,
        featured: shopifyProduct.tags?.includes('featured') || false,
        slug: shopifyProduct.handle,
        createdAt: new Date(shopifyProduct.created_at),
        updatedAt: new Date(shopifyProduct.updated_at),
    };
}

/**
 * Convert our Product model to a Shopify product
 */
export function productToShopifyProduct(product: Product): ShopifyProduct {
    return {
        id: product.id,
        title: product.name,
        body_html: product.description,
        vendor: 'Store',
        product_type: product.category,
        handle: product.slug,
        variants: [
            {
                id: `variant-${product.id}`,
                product_id: product.id,
                title: 'Default',
                price: product.price.toString(),
                sku: product.sku,
                position: 1,
                inventory_quantity: product.stock,
                requires_shipping: true,
                taxable: true,
                weight: 0,
                weight_unit: 'kg',
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                barcode: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
        images: product.images.map((src, index) => ({
            id: `image-${index}-${product.id}`,
            product_id: product.id,
            position: index + 1,
            src,
            alt: product.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })),
        tags: product.featured ? 'featured' : '',
        status: 'active',
        published_at: new Date().toISOString(),
        created_at: product.createdAt
            ? new Date(product.createdAt).toISOString()
            : new Date().toISOString(),
        updated_at: product.updatedAt
            ? new Date(product.updatedAt).toISOString()
            : new Date().toISOString(),
    };
}

/**
 * Convert a Shopify collection to our Category model
 */
export function shopifyCollectionToCategory(
    collection: ShopifyCollection
): Category {
    return {
        id: collection.id,
        name: collection.title,
        description: collection.body_html,
        slug: collection.handle,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
    };
}

/**
 * Convert our Category model to a Shopify collection
 */
export function categoryToShopifyCollection(
    category: Category
): ShopifyCollection {
    return {
        id: category.id,
        title: category.name,
        body_html: category.description || '',
        handle: category.slug,
        published_at: new Date().toISOString(),
        created_at: category.createdAt
            ? new Date(category.createdAt).toISOString()
            : new Date().toISOString(),
        updated_at: category.updatedAt
            ? new Date(category.updatedAt).toISOString()
            : new Date().toISOString(),
    };
}

/**
 * Configure the Shopify API client (if using Shopify as backend)
 */
export function initShopifyClient(shopDomain: string, accessToken: string) {
    // Implementation would depend on which Shopify API client you use
    // This is a placeholder for the configuration

    return {
        product: {
            list: async (): Promise<ShopifyProduct[]> => {
                // Implementation for fetching products from Shopify
                return [];
            },
            create: async (
                product: Partial<ShopifyProduct>
            ): Promise<ShopifyProduct> => {
                // Implementation for creating a product in Shopify
                return {} as ShopifyProduct;
            },
            // Other methods for products
        },
        collection: {
            list: async (): Promise<ShopifyCollection[]> => {
                // Implementation for fetching collections from Shopify
                return [];
            },
            // Other methods for collections
        },
        // Other Shopify resources
    };
}
