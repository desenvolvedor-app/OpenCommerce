import {
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Tag,
    TagIcon,
    Truck,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    const routes = [
        {
            href: '/admin',
            icon: LayoutDashboard,
            title: 'Dashboard',
        },
        {
            href: '/admin/orders',
            icon: ShoppingCart,
            title: 'Orders',
        },
        {
            href: '/admin/products',
            icon: ShoppingBag,
            title: 'Products',
        },
        {
            href: '/admin/categories',
            icon: TagIcon,
            title: 'Categories',
        },
        {
            href: '/admin/customers',
            icon: Users,
            title: 'Customers',
        },
        {
            href: '/admin/inventory',
            icon: Package,
            title: 'Inventory',
        },
        {
            href: '/admin/shipping',
            icon: Truck,
            title: 'Shipping',
        },
        {
            href: '/admin/discounts',
            icon: Tag,
            title: 'Discounts',
        },
        {
            href: '/admin/settings',
            icon: Settings,
            title: 'Settings',
        },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col">
            {/* Admin Header */}
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="md:hidden">
                            <div className="py-4">
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 font-semibold mb-6 px-4"
                                >
                                    <ShoppingBag className="h-6 w-6" />
                                    <span>Commerce Admin</span>
                                </Link>
                                <nav className="grid gap-2 px-2">
                                    {routes.map((route) => {
                                        const Icon = route.icon;
                                        const isActive =
                                            pathname === route.href ||
                                            pathname?.startsWith(
                                                `${route.href}/`
                                            );

                                        return (
                                            <Link
                                                key={route.href}
                                                href={route.href}
                                                className={cn(
                                                    buttonVariants({
                                                        variant: isActive
                                                            ? 'default'
                                                            : 'ghost',
                                                        size: 'sm',
                                                    }),
                                                    'justify-start h-10'
                                                )}
                                            >
                                                <Icon className="mr-2 h-4 w-4" />
                                                {route.title}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link
                        href="/admin"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <ShoppingBag className="h-6 w-6" />
                        <span className="hidden sm:inline-block">
                            Commerce Admin
                        </span>
                    </Link>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'hidden md:flex'
                        )}
                    >
                        View Store
                    </Link>
                    <Link
                        href="/auth/logout"
                        className={cn(
                            buttonVariants({ variant: 'ghost', size: 'sm' }),
                            'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                        )}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Link>
                </div>
            </header>

            {/* Main layout */}
            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="hidden border-r bg-muted/40 md:flex md:w-64 md:flex-col">
                    <ScrollArea className="flex flex-col h-full">
                        <nav className="grid gap-2 p-4">
                            {routes.map((route) => {
                                const Icon = route.icon;
                                const isActive =
                                    pathname === route.href ||
                                    pathname?.startsWith(`${route.href}/`);

                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            buttonVariants({
                                                variant: isActive
                                                    ? 'default'
                                                    : 'ghost',
                                                size: 'sm',
                                            }),
                                            'justify-start h-10'
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {route.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </div>

                {/* Main content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
