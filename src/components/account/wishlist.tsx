'use client';

import { Heart, Loader2, ShoppingCart, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import {
    getUserWishlist,
    removeFromWishlist,
} from '@/services/wishlist-service';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

export function Wishlist() {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const { addItem } = useCartStore();

    useEffect(() => {
        async function fetchWishlist() {
            if (!user) return;

            try {
                setIsLoading(true);
                const items = await getUserWishlist(user.id);
                setWishlistItems(items);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                toast.error('Failed to load wishlist');
            } finally {
                setIsLoading(false);
            }
        }

        fetchWishlist();
    }, [user]);

    const handleRemoveFromWishlist = async (productId: string) => {
        if (!user) return;

        try {
            setRemovingId(productId);
            await removeFromWishlist(user.id, productId);
            setWishlistItems(
                wishlistItems.filter((item) => item.id !== productId)
            );
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0] || undefined,
        });

        toast.success(`${product.name} added to cart`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                    Your wishlist is empty
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    Add products to your wishlist to keep track of items you are
                    interested in.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlist</h2>

            <div className="rounded-md border">
                <div className="divide-y">
                    {wishlistItems.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 p-4"
                        >
                            <div className="h-24 w-24 relative bg-secondary rounded overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </Link>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-secondary">
                                        <Heart className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="hover:underline font-medium line-clamp-1"
                                >
                                    {product.name}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {product.category}
                                </p>
                                <p className="font-medium mt-1">
                                    {formatPrice(product.price)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="sm:hidden"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() =>
                                        handleRemoveFromWishlist(product.id)
                                    }
                                    disabled={removingId === product.id}
                                >
                                    {removingId === product.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
