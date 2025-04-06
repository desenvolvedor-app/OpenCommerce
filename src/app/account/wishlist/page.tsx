import { Metadata } from 'next';

import { Wishlist } from '@/components/account/wishlist';

export const metadata: Metadata = {
    title: 'My Wishlist',
    description: 'View and manage your saved products',
};

export default function WishlistPage() {
    return <Wishlist />;
}
