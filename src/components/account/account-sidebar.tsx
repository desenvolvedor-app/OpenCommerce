'use client';

import {
    CreditCard,
    Heart,
    Home,
    Loader2,
    LogOut,
    Map,
    Settings,
    ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase/auth';
import { useAuth } from '@/providers/auth-provider';

export function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('An error occurred while signing out');
        } finally {
            setIsLoading(false);
        }
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const navigation = [
        { name: 'Overview', href: '/account', icon: Home },
        { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
        { name: 'Addresses', href: '/account/addresses', icon: Map },
        { name: 'Payment Methods', href: '/account/payment', icon: CreditCard },
        { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
        { name: 'Profile', href: '/account/profile', icon: Settings },
    ];

    return (
        <div className="space-y-6">
            {/* User info */}
            <div className="flex flex-col items-center text-center p-6 bg-accent/50 rounded-lg">
                <Avatar className="h-16 w-16 mb-3">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-medium text-base truncate max-w-[200px]">
                        {user?.name || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out button */}
            <div className="pt-4 space-y-2">
                <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={handleSignOut}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Need help?{' '}
                    <a href="/help" className="text-primary hover:underline">
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
}
