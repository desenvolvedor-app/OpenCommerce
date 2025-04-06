import { Metadata } from 'next';

import { AddressBook } from '@/components/account/address-book';

export const metadata: Metadata = {
    title: 'Address Book',
    description: 'Manage your shipping and billing addresses',
};

export default function AddressesPage() {
    return <AddressBook />;
}
