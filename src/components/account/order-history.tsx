'use client';

import { Loader2, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate, formatPrice } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { getUserOrders } from '@/services/order-service';
import { Order } from '@/types';

export function OrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;

            try {
                setIsLoading(true);
                const result = await getUserOrders(user.id, { limit: 10 });
                setOrders(result.orders);
                setLastVisible(result.lastVisible);
                setHasMore(!!result.lastVisible && result.orders.length === 10);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, [user]);

    const loadMoreOrders = async () => {
        if (!user || !lastVisible) return;

        try {
            setIsLoading(true);
            const result = await getUserOrders(user.id, {
                limit: 10,
                lastVisible,
            });
            setOrders([...orders, ...result.orders]);
            setLastVisible(result.lastVisible);
            setHasMore(!!result.lastVisible && result.orders.length === 10);
        } catch (error) {
            console.error('Error fetching more orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadgeVariant = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'outline';
            case 'processing':
                return 'secondary';
            case 'shipped':
                return 'default';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    You have not placed any orders yet. Browse our products and
                    start shopping.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/products">Shop Now</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    #{order.id.slice(0, 8)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(order.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant='outline'
                                    >
                                        {order.status.charAt(0).toUpperCase() +
                                            order.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatPrice(order.total)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                        >
                                            View
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {hasMore && (
                <div className="flex justify-center mt-6">
                    <Button
                        onClick={loadMoreOrders}
                        variant="outline"
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
}
