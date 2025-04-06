import { Clock, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import ProductCarousel from '@/components/product/product-carousel';
import { Button } from '@/components/ui/button';
import CategoryCard from '@/components/ui/category-card';
import { CollectionBanner } from '@/components/ui/collection-banner';
import { FeatureGrid } from '@/components/ui/feature-grid';
import { Hero } from '@/components/ui/hero';
import { SectionTitle } from '@/components/ui/section-title';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { getFeaturedCategories } from '@/services/category-service';
import { getFeaturedProducts } from '@/services/product-service';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
    // Fetch real data
    const featuredProducts = await getFeaturedProducts(8);
    const featuredCategories = await getFeaturedCategories(4);

    // Sanitize data to avoid timestamp serialization issues
    const sanitizedProducts = sanitizeFirestoreData(featuredProducts);
    const sanitizedCategories = sanitizeFirestoreData(featuredCategories);

    // Feature icons for trust badges section
    const features = [
        {
            icon: Truck,
            title: 'Free Shipping',
            description: 'Free shipping on all orders over $50',
        },
        {
            icon: RotateCcw,
            title: 'Easy Returns',
            description: '30-day money back guarantee',
        },
        {
            icon: ShieldCheck,
            title: 'Secure Checkout',
            description: 'Encrypted and secured payments',
        },
        {
            icon: Clock,
            title: '24/7 Support',
            description: 'Customer support available anytime',
        },
    ];

    return (
        <>
            <SiteHeader />
            <main className="min-h-screen pb-16">
                {/* Hero Section */}
                <Hero />

                {/* Featured Categories Section */}
                <section className="py-16 container mx-auto px-4">
                    <SectionTitle
                        title="Shop by Category"
                        description="Explore our collections by category"
                        viewAllLink="/categories"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sanitizedCategories?.map((category, index) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                featured={index === 0}
                            />
                        ))}
                    </div>
                </section>

                {/* Trust Badges Section */}
                <section className="py-12 bg-background border-y">
                    <div className="container mx-auto px-4">
                        <FeatureGrid features={features} />
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="py-16 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <SectionTitle
                            title="Featured Products"
                            description="Explore our handpicked selection of featured products"
                            viewAllLink="/products?featured=true"
                        />

                        <ProductCarousel products={sanitizedProducts} />
                    </div>
                </section>

                {/* Collection Banner */}
                <section className="py-8 container mx-auto px-4">
                    <CollectionBanner
                        title="Summer Collection 2023"
                        description="Discover our latest summer styles perfect for any occasion. Light fabrics, vibrant colors, and exclusive designs."
                        image="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                        buttonText="Shop Collection"
                        buttonLink="/products?collection=summer"
                    />
                </section>

                {/* New Arrivals Banner */}
                <section className="py-8 container mx-auto px-4 my-8">
                    <CollectionBanner
                        title="New Arrivals"
                        description="Be the first to discover our newest styles. Fresh drops added weekly to keep your wardrobe up to date."
                        image="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                        buttonText="Shop New"
                        buttonLink="/products?sort=newest"
                        position="right"
                    />
                </section>

                {/* Promotion Banner */}
                <section className="py-12 bg-primary text-primary-foreground mt-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Special Offer
                        </h2>
                        <p className="text-xl mb-6 max-w-xl mx-auto">
                            Use code{' '}
                            <span className="font-bold">WELCOME10</span> at
                            checkout for 10% off your first order
                        </p>
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/products">Shop Now</Link>
                        </Button>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
