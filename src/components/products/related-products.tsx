'use client';

import Image from 'next/image';
import Link from 'next/link';

import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

interface RelatedProductsProps {
    products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                >
                    <div className="aspect-square bg-secondary relative overflow-hidden rounded-lg">
                        <Image
                            src={
                                product.images[0] || 'https://picsum.photos/400'
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                    <div className="mt-3">
                        <h3 className="font-medium text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {product.category}
                        </p>
                        <p className="mt-1 font-semibold">
                            {formatPrice(product.price)}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
