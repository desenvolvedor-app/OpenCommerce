import { NextRequest, NextResponse } from 'next/server';

import {
    categoryToShopifyCollection,
    productToShopifyProduct,
} from '@/lib/shopify/shopify-adapter';
import { getCategories } from '@/services/category-service';
import { getProducts } from '@/services/product-service';

/**
 * This endpoint emulates the Shopify Storefront API to allow
 * clients built for Shopify to work with our platform.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const resource = searchParams.get('resource');

    try {
        if (resource === 'products') {
            const { products } = await getProducts();
            const shopifyProducts = products.map(productToShopifyProduct);

            return NextResponse.json({
                products: shopifyProducts,
            });
        } else if (resource === 'collections') {
            const categories = await getCategories();
            const shopifyCollections = categories.map(
                categoryToShopifyCollection
            );

            return NextResponse.json({
                collections: shopifyCollections,
            });
        } else {
            return NextResponse.json(
                {
                    error: 'Unknown resource type',
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in storefront API:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle GraphQL queries (similar to Shopify's Storefront API)
        if (body.query) {
            // This is a simplified example - a real implementation would need a proper GraphQL server
            if (body.query.includes('products')) {
                const { products } = await getProducts();
                const shopifyProducts = products.map(productToShopifyProduct);

                return NextResponse.json({
                    data: {
                        products: {
                            edges: shopifyProducts.map((product) => ({
                                node: product,
                            })),
                        },
                    },
                });
            }
        }

        return NextResponse.json(
            {
                error: 'Unsupported query',
            },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in storefront API:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
