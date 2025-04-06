'use client';

import { Eye, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { name, price, comparePrice, slug, images, stock, featured } =
        product;
    const { addItem } = useCartStore();

    const discount =
        comparePrice && comparePrice > price
            ? Math.round((1 - price / comparePrice) * 100)
            : null;

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
        <Card className="group overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md border-0 bg-background rounded-xl">
            <Link
                href={`/products/${slug}`}
                className="relative block h-[300px] w-full overflow-hidden"
            >
                <div className="absolute inset-0 bg-muted/40">
                    {images && images.length > 0 ? (
                        <Image
                            src={images[0]}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                                No image
                            </span>
                        </div>
                    )}
                </div>

                {/* Product badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {featured && (
                        <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                        >
                            Featured
                        </Badge>
                    )}

                    {discount && (
                        <Badge
                            variant="destructive"
                            className="text-xs px-2 py-0.5"
                        >
                            {discount}% OFF
                        </Badge>
                    )}

                    {stock <= 0 && (
                        <Badge
                            variant="outline"
                            className="bg-background/80 text-xs px-2 py-0.5"
                        >
                            Out of Stock
                        </Badge>
                    )}
                </div>

                {/* Quick action buttons */}
                <div className="absolute right-2 top-2 flex flex-col gap-2 translate-x-12 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        asChild
                    >
                        <Link href={`/products/${slug}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Quick view</span>
                        </Link>
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                    >
                        <Heart className="h-4 w-4" />
                        <span className="sr-only">Add to wishlist</span>
                    </Button>
                </div>
            </Link>

            <CardContent className="flex-1 p-4">
                <Link href={`/products/${slug}`} className="space-y-1">
                    <h3 className="font-medium text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">
                            {formatPrice(price)}
                        </span>
                        {comparePrice && comparePrice > price && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(comparePrice)}
                            </span>
                        )}
                    </div>
                </Link>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full"
                    size="sm"
                    disabled={stock <= 0}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
            </CardFooter>
        </Card>
    );
}
