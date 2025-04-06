import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Category } from '@/types';

interface CategoryCardProps {
    category: Category;
    featured?: boolean;
}

export default function CategoryCard({
    category,
    featured = false,
}: CategoryCardProps) {
    const { name, description, slug, image } = category;

    return (
        <Link
            href={`/categories/${slug}`}
            className={cn(
                'group relative overflow-hidden rounded-xl block transition-all hover:shadow-lg',
                featured ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-square'
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:via-black/50 transition-colors z-10" />

            {image ? (
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
                    {name}
                </h3>
                {description && (
                    <p className="text-white/90 mt-1 line-clamp-2 text-sm drop-shadow-sm">
                        {description}
                    </p>
                )}
                <div className="mt-3 flex items-center text-sm text-white font-medium group-hover:underline underline-offset-4">
                    <span>Shop now</span>
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
