'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewProductRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/products/add');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Redirecting to the new product page...</p>
        </div>
    );
}
