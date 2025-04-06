'use client';

import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import ProductCarousel from '@/components/product/product-carousel';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import {
    getFeaturedProducts,
    getProductBySlug,
} from '@/services/product-service';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

export default function ProductPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();

    useEffect(() => {
        async function loadProduct() {
            try {
                setIsLoading(true);
                const productData = await getProductBySlug(slug);

                if (!productData) {
                    notFound();
                }

                setProduct(productData);

                // Get related products
                const related = await getFeaturedProducts(4);
                setRelatedProducts(
                    related.filter((p) => p.id !== productData.id)
                );
            } catch (error) {
                console.error('Error loading product:', error);
                toast.error('Failed to load product');
            } finally {
                setIsLoading(false);
            }
        }

        loadProduct();
    }, [slug]);

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images?.[0] || undefined,
        });

        toast.success(`${product.name} added to cart`);
    };

    const increaseQuantity = () => {
        if (!product) return;
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (isLoading) {
        return (
            <>
                <SiteHeader />
                <main className="container mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-12 w-1/3 bg-muted rounded mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="aspect-square bg-muted rounded"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-muted rounded"></div>
                                <div className="h-6 w-24 bg-muted rounded"></div>
                                <div className="h-32 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <SiteFooter />
            </>
        );
    }

    if (!product) return notFound();

    return (
        <>
            <SiteHeader />
            <main className="container mx-auto py-12 px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                        {product.images && product.images.length > 0 ? (
                            <div className="aspect-square w-full">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="aspect-square w-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">
                                    No image available
                                </span>
                            </div>
                        )}

                        {/* Additional product images */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {product.images
                                    .slice(0, 4)
                                    .map((image, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square w-full relative overflow-hidden rounded-md"
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.name} - Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-2xl font-bold mt-4">
                            {formatPrice(product.price)}
                        </p>

                        {/* Stock status */}
                        <div className="mt-2">
                            {product.stock > 0 ? (
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="text-sm text-red-600 dark:text-red-400">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* SKU */}
                        {product.sku && (
                            <div className="mt-2 text-sm text-muted-foreground">
                                SKU: {product.sku}
                            </div>
                        )}

                        {/* Quantity selector */}
                        {product.stock > 0 && (
                            <div className="mt-6 flex items-center">
                                <span className="mr-3">Quantity:</span>
                                <div className="flex items-center border rounded-md">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={decreaseQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-10 text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={increaseQuantity}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Add to cart button */}
                        <div className="mt-6">
                            <Button
                                size="lg"
                                className="w-full"
                                disabled={product.stock <= 0}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>

                        {/* Product description */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold">
                                Description
                            </h2>
                            <div className="mt-4 prose dark:prose-invert">
                                <p>{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold mb-6">
                            You might also like
                        </h2>
                        <ProductCarousel products={relatedProducts} />
                    </section>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
