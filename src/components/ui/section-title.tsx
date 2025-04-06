import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface SectionTitleProps {
    title: string;
    description?: string;
    viewAllLink?: string;
    children?: ReactNode;
}

export function SectionTitle({
    title,
    description,
    viewAllLink,
    children,
}: SectionTitleProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold">{title}</h2>
                {description && (
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        {description}
                    </p>
                )}
            </div>

            {viewAllLink ? (
                <Button variant="link" asChild className="text-primary -mr-4">
                    <Link href={viewAllLink} className="flex items-center">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                children
            )}
        </div>
    );
}
