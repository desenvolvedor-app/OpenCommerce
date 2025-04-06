'use client';

import {
    ArrowRight,
    CreditCard,
    Heart,
    MapPin,
    ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { getUserOrders } from '@/services/order-service';
import { Order } from '@/types';

export function AccountOverview() {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRecentOrders() {
            if (!user) return;

            try {
                const { orders } = await getUserOrders(user.id, { limit: 3 });
                setRecentOrders(orders);
            } catch (error) {
                console.error('Error fetching recent orders:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRecentOrders();
    }, [user]);

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none shadow-sm">
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold">
                        Welcome back, {user.name}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        From your account dashboard you can view your recent
                        orders, manage your shipping addresses, and edit your
                        password and account details.
                    </p>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href="/account/orders"
                            className="flex items-center"
                        >
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                ) : recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium">
                                                    Order #
                                                    {order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Placed on{' '}
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <Badge className="capitalize">
                                                {order.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.items.length}{' '}
                                                    {order.items.length === 1
                                                        ? 'item'
                                                        : 'items'}{' '}
                                                    • Total:
                                                    <span className="font-medium text-foreground ml-1">
                                                        {formatPrice(
                                                            order.total
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                >
                                                    View Order
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">
                                No orders yet
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                                You have not placed any orders yet. Check out
                                our products and start shopping.
                            </p>
                            <Button asChild>
                                <Link href="/products">Shop Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Account Quick Links */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Account Management
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-lg">
                                <MapPin className="h-5 w-5 mr-2 text-primary" />
                                Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <p className="text-sm text-muted-foreground">
                                Manage your shipping and billing addresses
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                asChild
                            >
                                <Link href="/account/addresses">
                                    Manage Addresses
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-lg">
                                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                                Payment Methods
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <p className="text-sm text-muted-foreground">
                                Add and manage your payment methods
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                asChild
                            >
                                <Link href="/account/payment">
                                    Manage Payments
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-lg">
                                <Heart className="h-5 w-5 mr-2 text-primary" />
                                Wishlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <p className="text-sm text-muted-foreground">
                                View and manage your wishlist items
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                asChild
                            >
                                <Link href="/account/wishlist">
                                    View Wishlist
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
