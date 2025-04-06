'use client';

import { Check, Heart, Minus, Plus, Share2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCartStore();

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0],
        });

        toast.success(`${product.name} added to cart`);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary">
                    <Image
                        src={
                            product.images[selectedImage] || '/placeholder.png'
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {product.images.map((image, index) => (
                            <Button
                                key={index}
                                className={`w-20 h-20 rounded border-2 ${
                                    selectedImage === index
                                        ? 'border-primary'
                                        : 'border-transparent'
                                }`}
                                onClick={() => setSelectedImage(index)}
                            >
                                <div className="aspect-square relative rounded overflow-hidden">
                                    <Image
                                        src={image}
                                        alt={`${product.name} - Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-2xl font-semibold mt-2">
                        {formatPrice(product.price)}
                    </p>
                </div>

                <div className="prose prose-sm max-w-none">
                    <p>{product.description}</p>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                            <Button
                                onClick={decreaseQuantity}
                                className="p-2 disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 border-x text-center w-12">
                                {quantity}
                            </span>
                            <Button
                                onClick={increaseQuantity}
                                className="p-2 disabled:opacity-50"
                                disabled={quantity >= product.stock}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center text-sm">
                            <span
                                className={
                                    product.stock > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {product.stock > 0 ? (
                                    <span className="flex items-center">
                                        <Check className="h-4 w-4 mr-1" />
                                        In Stock
                                    </span>
                                ) : (
                                    'Out of Stock'
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            size="lg"
                            className="flex-1"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                        </Button>

                        <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">SKU:</span>
                        <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Category:</span>
                        <span className="capitalize">{product.category}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
