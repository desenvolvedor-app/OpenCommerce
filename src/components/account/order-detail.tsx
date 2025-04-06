'use client';

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Package,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ORDER_STATUSES } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import { Order } from '@/types';

interface OrderDetailProps {
    order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
    // Get status color class for UI
    const getStatusColorClass = (status: Order['status']) => {
        const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
        return statusConfig
            ? statusConfig.color
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Get proper status label with capitalization
    const getStatusLabel = (status: Order['status']) => {
        const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
        return statusConfig
            ? statusConfig.label
            : status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Format the timestamp properly
    const getFormattedDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';

        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
        return formatDate(date);
    };

    // Calculate the status step for the progress indicator
    const getStatusStep = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 1;
            case 'processing':
                return 2;
            case 'shipped':
                return 3;
            case 'delivered':
                return 4;
            default:
                return 0;
        }
    };

    const currentStep = getStatusStep(order.status);

    return (
        <div className="space-y-8">
            {/* Order header with status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Order #{order.id.slice(0, 8)}
                        {order.status === 'cancelled' && (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Placed on {getFormattedDate(order.createdAt)}
                    </p>
                </div>

                <Badge
                    className={`px-3 py-1 text-sm font-medium border ${getStatusColorClass(order.status)}`}
                >
                    {getStatusLabel(order.status)}
                </Badge>
            </div>

            {/* Order Progress (for non-cancelled orders) */}
            {order.status !== 'cancelled' && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Order Progress</CardTitle>
                        <CardDescription>
                            Track your order status and estimated delivery
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                            currentStep >= 1
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs mt-1 text-center">
                                        Confirmed
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                            currentStep >= 2
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs mt-1 text-center">
                                        Processing
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                            currentStep >= 3
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs mt-1 text-center">
                                        Shipped
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                            currentStep >= 4
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs mt-1 text-center">
                                        Delivered
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1 absolute top-5 left-0 right-0 mx-12 bg-muted">
                                <div
                                    className="h-1 bg-primary transition-all duration-500"
                                    style={{
                                        width: `${Math.max(0, ((currentStep - 1) * 100) / 3)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Estimated delivery date */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Estimated Delivery
                            </p>
                            <p className="font-medium mt-1">
                                {currentStep >= 4
                                    ? 'Delivered'
                                    : currentStep >= 3
                                      ? 'Expected delivery in 1-2 days'
                                      : currentStep >= 2
                                        ? 'Expected delivery in 3-5 days'
                                        : 'Processing your order'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Order details grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Order Items */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                            Order Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {order.items.map((item) => (
                                <div
                                    key={`${item.productId}-${item.variantId || ''}`}
                                    className="flex items-center gap-4 p-4"
                                >
                                    <div className="h-20 w-20 relative bg-muted rounded-md overflow-hidden">
                                        {item.productImage ? (
                                            <Image
                                                src={item.productImage}
                                                alt={item.productName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-muted">
                                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-base">
                                            {item.productName}
                                        </h4>
                                        {item.variantName && (
                                            <p className="text-sm text-muted-foreground">
                                                {item.variantName}
                                            </p>
                                        )}
                                        <div className="flex justify-between mt-1 text-sm">
                                            <span>
                                                {formatPrice(item.unitPrice)} ×{' '}
                                                {item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatPrice(item.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    {/* Reorder button for completed orders */}
                    {order.status === 'delivered' && (
                        <CardFooter className="bg-muted/30 border-t px-4 py-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Reorder Items
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Shipping Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center">
                            <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
                            Shipping Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="font-medium">
                                {order.shippingAddress.firstName}{' '}
                                {order.shippingAddress.lastName}
                            </p>
                            <p className="text-sm">
                                {order.shippingAddress.address}
                            </p>
                            <p className="text-sm">
                                {order.shippingAddress.city},{' '}
                                {order.shippingAddress.state}{' '}
                                {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm">
                                {order.shippingAddress.country}
                            </p>
                            <Separator className="my-3" />
                            <p className="text-sm">
                                <span className="text-muted-foreground">
                                    Email:{' '}
                                </span>
                                {order.shippingAddress.email}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">
                                    Phone:{' '}
                                </span>
                                {order.shippingAddress.phone}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>
                                <span>{formatPrice(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Tax
                                </span>
                                <span>{formatPrice(order.tax)}</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground">
                                <span className="font-medium">
                                    Payment Method:{' '}
                                </span>
                                {order.paymentMethod === 'card'
                                    ? 'Credit Card'
                                    : order.paymentMethod}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t px-4 py-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                        >
                            <Link href="/account/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Need help or action required */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
                        <div>
                            <h3 className="font-medium">
                                Need help with your order?
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                If you have any questions about your order, we
                                are here to help.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm">
                                Contact Support
                            </Button>
                            {order.status === 'pending' && (
                                <Button variant="destructive" size="sm">
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
