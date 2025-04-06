import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Order Confirmation',
    description: 'Your order has been placed successfully',
};

export default function OrderConfirmationPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const orderId =
        typeof searchParams.orderId === 'string' ? searchParams.orderId : 'N/A';

    return (
        <>
            <SiteHeader />
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for your purchase. We have received your order
                        and are processing it now.
                    </p>

                    <div className="bg-secondary p-6 rounded-lg mb-8">
                        <p className="text-sm text-muted-foreground">
                            Order number
                        </p>
                        <p className="font-medium">{orderId}</p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                        A confirmation email has been sent to your email
                        address. You can track your order status in your account
                        dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild variant="outline">
                            <Link href="/account/orders">View Order</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/products">
                                Continue Shopping{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
