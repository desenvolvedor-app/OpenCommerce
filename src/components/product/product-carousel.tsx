'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Product } from '@/types';

import ProductCard from './product-card';

interface ProductCarouselProps {
    products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [productsToShow, setProductsToShow] = useState(1);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate how many products to show based on viewport width
    // But only do this on the client side after component is mounted
    useEffect(() => {
        function updateProductsToShow() {
            const width = window.innerWidth;
            if (width < 640)
                setProductsToShow(1); // Mobile
            else if (width < 1024)
                setProductsToShow(2); // Tablet
            else if (width < 1280)
                setProductsToShow(3); // Small desktop
            else setProductsToShow(4); // Large desktop
        }

        // Initial calculation
        updateProductsToShow();
        setMounted(true);

        // Recalculate on resize
        window.addEventListener('resize', updateProductsToShow);
        return () => window.removeEventListener('resize', updateProductsToShow);
    }, []);

    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex + productsToShow < products.length;

    const scrollLeft = () => {
        if (canScrollLeft) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const scrollRight = () => {
        if (canScrollRight) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-8">
                <p>No products available.</p>
            </div>
        );
    }

    // Only show carousel after client-side hydration is complete
    // This prevents the hydration mismatch
    return (
        <div className="relative">
            {/* Navigation buttons */}
            {mounted && canScrollLeft && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md"
                    onClick={scrollLeft}
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Previous products</span>
                </Button>
            )}

            {/* Product carousel */}
            <div className="overflow-hidden" ref={containerRef}>
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={
                        mounted
                            ? {
                                  transform: `translateX(-${currentIndex * (100 / productsToShow)}%)`,
                              }
                            : {}
                    }
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="px-3"
                            style={
                                mounted
                                    ? { flex: `0 0 ${100 / productsToShow}%` }
                                    : { flex: '0 0 100%' }
                            }
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            {mounted && canScrollRight && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md"
                    onClick={scrollRight}
                >
                    <ChevronRight className="h-5 w-5" />
                    <span className="sr-only">Next products</span>
                </Button>
            )}
        </div>
    );
}
