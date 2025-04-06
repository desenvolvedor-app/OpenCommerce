import { ChevronDown, Filter } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import ProductCard from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/ui/section-title';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { getCategories } from '@/services/category-service';
import { getProducts } from '@/services/product-service';

export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
    const { products } = await getProducts();
    const categories = await getCategories();

    // Sanitize data to avoid timestamp serialization issues
    const sanitizedProducts = sanitizeFirestoreData(products);
    const sanitizedCategories = sanitizeFirestoreData(categories);

    return (
        <>
            <SiteHeader />
            <main className="container mx-auto py-12 px-4">
                <SectionTitle
                    title="All Products"
                    description="Browse our entire collection of quality products"
                />

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full"
                        >
                            <Link
                                href="/products"
                                className="flex items-center"
                            >
                                All Products
                            </Link>
                        </Button>
                        {sanitizedCategories.map((category) => (
                            <Button
                                key={category.id}
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                asChild
                            >
                                <Link href={`/categories/${category.slug}`}>
                                    {category.name}
                                </Link>
                            </Button>
                        ))}
                    </div>

                    {/* Sort & Filter */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            Sort
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Products Grid */}
                {sanitizedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sanitizedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted/40 rounded-lg">
                        <p className="text-muted-foreground">
                            No products found.
                        </p>
                    </div>
                )}

                {/* Pagination - Static for now */}
                {sanitizedProducts.length > 0 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-primary text-primary-foreground"
                            >
                                1
                            </Button>
                            <Button variant="outline" size="sm">
                                2
                            </Button>
                            <Button variant="outline" size="sm">
                                3
                            </Button>
                            <Button variant="outline" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
