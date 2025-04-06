import { Metadata } from 'next';

import { PaymentMethods } from '@/components/account/payment-methods';

export const metadata: Metadata = {
    title: 'Payment Methods',
    description: 'Manage your saved payment methods',
};

export default function PaymentMethodsPage() {
    return <PaymentMethods />;
}
