'use client';

import {
    ChevronDown,
    LogOut,
    Menu,
    Moon,
    Search,
    ShoppingCart,
    Sun,
    User,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CartDrawer } from '@/components/cart/cart-drawer';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { signOut } from '@/lib/firebase/auth';
import { isAdmin } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/store/cart-store';

export function SiteHeader() {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { user } = useAuth();
    const cartCount = useCartStore((state) => state.count());
    const [isMounted, setIsMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Add effect to handle client-side hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const mainLinks = [
        {
            name: 'Home',
            href: '/',
        },
        {
            name: 'Products',
            href: '/products',
            children: [
                { name: 'All Products', href: '/products' },
                { name: 'Featured', href: '/products?featured=true' },
                { name: 'New Arrivals', href: '/products?sort=createdAt-desc' },
                {
                    name: 'Best Sellers',
                    href: '/products?sort=popularity-desc',
                },
            ],
        },
        {
            name: 'Categories',
            href: '/categories',
        },
        {
            name: 'About',
            href: '/about',
        },
    ];

    return (
        <header
            className={`sticky top-0 z-40 w-full bg-background transition-shadow duration-200 ${
                scrolled ? 'shadow-md' : 'border-b'
            }`}
        >
            {/* Announcement banner - optional */}
            <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
                <p>
                    Free shipping on orders over $50 | Use code WELCOME10 for
                    10% off
                </p>
            </div>

            <div className="container flex h-16 items-center justify-between">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[300px] sm:w-[350px]"
                    >
                        <div className="flex flex-col h-full">
                            <Link
                                href="/"
                                className="flex items-center py-4 border-b"
                                passHref
                            >
                                <span className="text-xl font-bold">
                                    OpenCommerce
                                </span>
                            </Link>

                            <nav className="flex-1 overflow-auto py-6">
                                <ul className="space-y-6">
                                    {mainLinks.map((link) => (
                                        <li key={link.href} className="px-2">
                                            {link.children ? (
                                                <div className="mb-3">
                                                    <span className="text-lg font-medium">
                                                        {link.name}
                                                    </span>
                                                    <ul className="mt-2 space-y-2 pl-3 border-l-2">
                                                        {link.children.map(
                                                            (child) => (
                                                                <li
                                                                    key={
                                                                        child.href
                                                                    }
                                                                >
                                                                    <SheetClose
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                child.href
                                                                            }
                                                                            className={`block py-1 text-base ${
                                                                                pathname ===
                                                                                child.href
                                                                                    ? 'text-primary font-medium'
                                                                                    : 'text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                child.name
                                                                            }
                                                                        </Link>
                                                                    </SheetClose>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <SheetClose asChild>
                                                    <Link
                                                        href={link.href}
                                                        className={`block py-2 text-lg ${
                                                            pathname ===
                                                            link.href
                                                                ? 'text-primary font-medium'
                                                                : ''
                                                        }`}
                                                    >
                                                        {link.name}
                                                    </Link>
                                                </SheetClose>
                                            )}
                                        </li>
                                    ))}
                                    {user && isAdmin(user) && (
                                        <li className="px-2">
                                            <SheetClose asChild>
                                                <Link
                                                    href="/admin"
                                                    className="block py-2 text-lg text-primary font-medium"
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            </SheetClose>
                                        </li>
                                    )}
                                </ul>
                            </nav>

                            <div className="border-t pt-4 pb-2 space-y-4">
                                {user ? (
                                    <div className="space-y-2">
                                        <SheetClose asChild>
                                            <Link
                                                href="/account"
                                                className="flex items-center py-2 px-2"
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                <span>My Account</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/account/orders"
                                                className="flex items-center py-2 px-2"
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                <span>My Orders</span>
                                            </Link>
                                        </SheetClose>
                                        <Button
                                            variant="outline"
                                            className="w-full mt-2"
                                            onClick={() => signOut()}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <SheetClose asChild>
                                            <Button asChild variant="outline">
                                                <Link href="/auth/login">
                                                    Sign In
                                                </Link>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button asChild>
                                                <Link href="/auth/register">
                                                    Register
                                                </Link>
                                            </Button>
                                        </SheetClose>
                                    </div>
                                )}

                                <div className="flex justify-center pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setTheme(
                                                theme === 'dark'
                                                    ? 'light'
                                                    : 'dark'
                                            )
                                        }
                                    >
                                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        <span className="ml-2">
                                            {theme === 'dark'
                                                ? 'Light'
                                                : 'Dark'}{' '}
                                            Mode
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/" className="flex items-center" passHref>
                    <span className="text-xl font-bold">OpenCommerce</span>
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {mainLinks.map((link) => (
                        <div key={link.href} className="relative group">
                            {link.children ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={`px-3 py-2 text-sm font-medium ${
                                                pathname === link.href
                                                    ? 'bg-accent font-semibold'
                                                    : ''
                                            }`}
                                        >
                                            {link.name}
                                            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {link.children.map((child) => (
                                            <DropdownMenuItem
                                                key={child.href}
                                                asChild
                                            >
                                                <Link href={child.href}>
                                                    {child.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    variant="ghost"
                                    asChild
                                    className={`px-3 py-2 text-sm font-medium ${
                                        pathname === link.href
                                            ? 'bg-accent font-semibold'
                                            : ''
                                    }`}
                                >
                                    <Link href={link.href}>{link.name}</Link>
                                </Button>
                            )}
                        </div>
                    ))}
                    {user && isAdmin(user) && (
                        <Link
                            href="/admin"
                            className="px-3 py-2 text-sm font-medium rounded-md text-primary hover:bg-accent"
                        >
                            Admin Dashboard
                        </Link>
                    )}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center space-x-1">
                    {/* Search */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Toggle theme"
                            >
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setTheme('system')}
                            >
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Account */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Account"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/account">My Account</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/account/orders">Orders</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="text-red-500"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Account"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/auth/login">Sign In</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/auth/register">Register</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Cart */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Shopping cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {isMounted && cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Search overlay */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 border-t border-b bg-background/95 backdrop-blur-sm p-4 shadow-lg">
                    <div className="container max-w-2xl mx-auto">
                        <div className="relative">
                            <Input
                                type="search"
                                placeholder="Search for products..."
                                className="w-full pl-10 pr-10"
                                autoFocus
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setIsSearchOpen(false)}
                            >
                                ESC
                            </Button>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            <p>Press ESC to close search</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart drawer */}
            <CartDrawer
                open={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </header>
    );
}
