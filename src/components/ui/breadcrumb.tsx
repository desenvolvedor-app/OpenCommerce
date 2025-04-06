import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    homeHref?: string;
}

export function Breadcrumb({ items, homeHref = '/' }: BreadcrumbProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link
                        href={homeHref}
                        className="text-muted-foreground hover:text-foreground flex items-center"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight
                            className="h-4 w-4 text-muted-foreground mx-1"
                            aria-hidden="true"
                        />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-muted-foreground hover:text-foreground hover:underline"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
