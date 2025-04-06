import { Metadata } from 'next';

import { OrderHistory } from '@/components/account/order-history';

export const metadata: Metadata = {
    title: 'Order History',
    description: 'View your past orders and track current orders',
};

export default function OrdersPage() {
    return <OrderHistory />;
}
