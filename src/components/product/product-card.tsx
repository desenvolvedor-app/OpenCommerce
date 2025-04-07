'use client';

import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking the button

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0] || undefined,
        });

        toast.success(`${product.name} added to cart`);
    };

    return (
        <div className="product-card group relative overflow-hidden rounded-md border bg-card transition-all">
            {/* Product image */}
            <Link
                href={`/products/${product.slug}`}
                className="aspect-square overflow-hidden"
            >
                <Image
                    src={product.images[0] || '/images/product-placeholder.png'}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover transition-transform group-hover:scale-105"
                />
                {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        Sale
                    </div>
                )}
            </Link>

            {/* Product info */}
            <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="product-title mb-1 text-sm font-medium">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">
                            {formatPrice(product.price)}
                        </span>
                        {product.comparePrice &&
                            product.comparePrice > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.comparePrice)}
                                </span>
                            )}
                    </div>
                </div>
            </div>

            {/* Hover buttons */}
            <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                </Button>
            </div>
        </div>
    );
}
