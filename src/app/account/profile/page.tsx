import { Metadata } from 'next';

import { ProfileEditor } from '@/components/account/profile-editor';

export const metadata: Metadata = {
    title: 'Profile Settings',
    description: 'Update your personal information and account settings',
};

export default function ProfilePage() {
    return <ProfileEditor />;
}
