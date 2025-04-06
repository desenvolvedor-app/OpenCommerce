'use client';

import { ReactNode, useEffect, useState } from 'react';

import { useCartStore } from '@/store/cart-store';

interface CartWrapperProps {
    children: ReactNode;
}

export function CartWrapper({ children }: CartWrapperProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Just access the store to initialize it, but don't use the values yet
    useCartStore((state) => state);

    // After hydration is complete, we can safely use the store values
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return <>{children}</>;
}
