import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <>
            <div className="container py-12 md:py-24 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-9xl font-bold text-primary">404</h1>
                    <h2 className="text-2xl font-semibold mt-4 mb-2">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        The page you are looking for does not exist or has been
                        moved.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
