'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/providers/auth-provider';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Client-side redirect if not authenticated after auth state is determined
        if (!loading && !user) {
            router.push('/auth/login?callbackUrl=/account');
        }
    }, [user, loading, router]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <>
                <SiteHeader />
                <main className="container py-10">
                    <div className="flex items-center justify-center h-[50vh]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </main>
                <SiteFooter />
            </>
        );
    }

    // If not authenticated and not loading, don't render children
    if (!user) {
        return null;
    }

    return (
        <>
            <SiteHeader />
            <main className="container py-10">
                <Breadcrumb items={[{ label: 'Account', href: '/account' }]} />

                <h1 className="text-3xl font-bold mt-6 mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Account Sidebar */}
                    <div className="md:col-span-1 order-2 md:order-1">
                        <div className="md:sticky md:top-24">
                            <AccountSidebar />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3 order-1 md:order-2">
                        {children}
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
