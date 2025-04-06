'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (!products.length) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    passHref
                >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                        <div className="aspect-square relative">
                            <Image
                                src={product.images[0] || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />

                            {product.stock <= 0 && (
                                <div className="absolute top-2 right-2">
                                    <Badge variant="destructive">
                                        Out of stock
                                    </Badge>
                                </div>
                            )}

                            {product.featured && (
                                <div className="absolute top-2 left-2">
                                    <Badge>Featured</Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="pt-4">
                            <h3 className="font-medium text-lg line-clamp-1">
                                {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                                {product.category}
                            </p>
                        </CardContent>

                        <CardFooter className="flex justify-between pt-0">
                            <p className="font-semibold">
                                {formatPrice(product.price)}
                            </p>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
