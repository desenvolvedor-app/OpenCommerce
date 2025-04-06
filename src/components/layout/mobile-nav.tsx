'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface MobileNavProps {
    setIsOpen: (open: boolean) => void;
}

export function MobileNav({ setIsOpen }: MobileNavProps) {
    const pathname = usePathname();

    const routes = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/categories', label: 'Categories' },
        { href: '/about', label: 'About' },
    ];

    return (
        <div className="flex flex-col gap-4 px-2 py-4">
            <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
            >
                <span className="font-bold text-xl">OpenCommerce</span>
            </Link>

            <div className="flex flex-col gap-3 mt-4">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-medium ${
                            pathname === route.href
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        } transition-colors hover:text-foreground`}
                    >
                        {route.label}
                    </Link>
                ))}
            </div>

            <div className="flex flex-col gap-2 mt-6">
                <Link href="/account" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                        Account
                    </Button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    );
}
