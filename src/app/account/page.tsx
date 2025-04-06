import { Metadata } from 'next';

import { AccountOverview } from '@/components/account/account-overview';

export const metadata: Metadata = {
    title: 'Account Overview',
    description: 'View your account information and recent orders',
};

export default function AccountPage() {
    return <AccountOverview />;
}
