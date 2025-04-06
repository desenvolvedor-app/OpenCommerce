'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Category } from '@/types';

interface ProductsFilterProps {
    categories: Category[];
}

export function ProductsFilter({ categories }: ProductsFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get initial values from URL
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(searchParams.get('category') || undefined);

    const [priceRange, setPriceRange] = useState<[number, number]>([
        parseInt(searchParams.get('minPrice') || '0'),
        parseInt(searchParams.get('maxPrice') || '1000'),
    ]);

    const [inStock, setInStock] = useState<boolean>(
        searchParams.get('inStock') === 'true'
    );

    const [sort, setSort] = useState<string>(
        searchParams.get('sort') || 'createdAt'
    );

    const [sortDir, setSortDir] = useState<string>(
        searchParams.get('dir') || 'desc'
    );

    // Apply filters function
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (selectedCategory) {
            params.set('category', selectedCategory);
        }

        params.set('minPrice', priceRange[0].toString());
        params.set('maxPrice', priceRange[1].toString());

        if (inStock) {
            params.set('inStock', 'true');
        }

        params.set('sort', sort);
        params.set('dir', sortDir);

        router.push(`/products?${params.toString()}`);
    };

    // Reset filters function
    const resetFilters = () => {
        setSelectedCategory(undefined);
        setPriceRange([0, 1000]);
        setInStock(false);
        setSort('createdAt');
        setSortDir('desc');

        router.push('/products');
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="all-categories"
                            checked={!selectedCategory}
                            onCheckedChange={() =>
                                setSelectedCategory(undefined)
                            }
                        />
                        <label
                            htmlFor="all-categories"
                            className="text-sm cursor-pointer"
                        >
                            All Categories
                        </label>
                    </div>

                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center space-x-2"
                        >
                            <Checkbox
                                id={`category-${category.id}`}
                                checked={selectedCategory === category.slug}
                                onCheckedChange={() => {
                                    setSelectedCategory(
                                        selectedCategory === category.slug
                                            ? undefined
                                            : category.slug
                                    );
                                }}
                            />
                            <label
                                htmlFor={`category-${category.id}`}
                                className="text-sm cursor-pointer"
                            >
                                {category.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) =>
                        setPriceRange(value as [number, number])
                    }
                />
                <div className="flex justify-between mt-2 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>

            <div>
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="in-stock"
                        checked={inStock}
                        onCheckedChange={(checked) => setInStock(!!checked)}
                    />
                    <label
                        htmlFor="in-stock"
                        className="text-sm cursor-pointer"
                    >
                        In Stock Only
                    </label>
                </div>
            </div>

            <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={`${sort}-${sortDir}`}
                    onChange={(e) => {
                        const [newSort, newDir] = e.target.value.split('-');
                        setSort(newSort);
                        setSortDir(newDir);
                    }}
                >
                    <option value="createdAt-desc">Newest</option>
                    <option value="createdAt-asc">Oldest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A-Z</option>
                    <option value="name-desc">Name: Z-A</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                </Button>
            </div>
        </div>
    );
}
