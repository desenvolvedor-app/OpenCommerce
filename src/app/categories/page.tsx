import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import CategoryCard from '@/components/ui/category-card';
import { sanitizeFirestoreData } from '@/lib/firebase/utils';
import { getCategories } from '@/services/category-service';

export const revalidate = 3600; // Revalidate every hour

export default async function CategoriesPage() {
    const categories = await getCategories();

    // Sanitize data to avoid timestamp serialization issues
    const sanitizedCategories = sanitizeFirestoreData(categories);

    return (
        <>
            <SiteHeader />
            <main className="container mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold mb-8">All Categories</h1>

                {sanitizedCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sanitizedCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No categories found.
                        </p>
                    </div>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
