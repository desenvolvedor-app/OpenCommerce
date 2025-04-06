import { notFound } from 'next/navigation';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import ProductCard from '@/components/product/product-card';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { getCategoryBySlug } from '@/services/category-service';
import { getProducts } from '@/services/product-service';

export const revalidate = 3600; // Revalidate every hour

export default async function CategoryPage({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const { products } = await getProducts({ category: category.slug });

    // Sanitize data to avoid timestamp serialization issues
    const sanitizedCategory = sanitizeFirestoreData(category);
    const sanitizedProducts = sanitizeFirestoreData(products);

    return (
        <>
            <SiteHeader />
            <main className="container mx-auto py-12 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">
                        {sanitizedCategory.name}
                    </h1>
                    {sanitizedCategory.description && (
                        <p className="mt-2 text-muted-foreground">
                            {sanitizedCategory.description}
                        </p>
                    )}
                </div>

                {sanitizedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sanitizedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No products found in this category.
                        </p>
                    </div>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
