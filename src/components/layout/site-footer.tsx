import {
    CreditCard,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
} from 'lucide-react';
import Link from 'next/link';

import { NewsletterSignup } from '@/components/ui/newsletter-signup';

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/40">
            {/* Newsletter Section */}
            <div className="border-b bg-muted/60">
                <div className="container py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                Subscribe to our newsletter
                            </h3>
                            <p className="text-muted-foreground">
                                Get the latest updates, news and product offers
                                sent straight to your inbox.
                            </p>
                        </div>
                        <div>
                            <NewsletterSignup />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Brand section */}
                    <div className="md:col-span-4 lg:col-span-5">
                        <Link href="/" className="inline-block mb-4">
                            <h2 className="text-2xl font-bold">OpenCommerce</h2>
                        </Link>
                        <p className="text-muted-foreground mb-4 max-w-md">
                            Modern e-commerce platform built with Next.js and
                            Firebase. Create your own online store with our
                            powerful and customizable solution.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Youtube className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick links columns */}
                    <div className="md:col-span-8 lg:col-span-7">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-medium text-lg mb-4">
                                    Shop
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="/products"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            All Products
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/categories"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Categories
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/products?sort=newest"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            New Arrivals
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/products?featured=true"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Featured
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/products?sale=true"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Sale
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-4">
                                    Account
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="/auth/login"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/auth/register"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Register
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/account/orders"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Order History
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/account/profile"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/wishlist"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Wishlist
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-4">
                                    Info
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="/about"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Contact
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/shipping"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Shipping Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/returns"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Returns & Exchanges
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/faq"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment methods & copyright */}
                <div className="border-t mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0">
                            &copy; {new Date().getFullYear()} OpenCommerce. All
                            rights reserved.
                        </p>

                        <div className="flex items-center space-x-4 order-1 md:order-2">
                            <span className="text-sm text-muted-foreground">
                                Payment methods:
                            </span>
                            <div className="flex space-x-2">
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                                <span className="sr-only">Credit card</span>
                                {/* Payment method icons */}
                                <div className="h-6 w-10 bg-muted rounded-sm"></div>
                                <div className="h-6 w-10 bg-muted rounded-sm"></div>
                                <div className="h-6 w-10 bg-muted rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
