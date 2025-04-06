'use client';

import {
    ArrowUpDown,
    Eye,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { getProducts } from '@/services/product-service';
import { Product } from '@/types';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                const { products: fetchedProducts } = await getProducts({
                    sortBy: sortField,
                    sortOrder: sortOrder,
                });
                setProducts(fetchedProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again.');
                toast.error('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, [sortField, sortOrder]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getColumnHeader = (field: string, label: string) => {
        return (
            <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort(field)}
            >
                {label}
                <ArrowUpDown size={16} className="ml-2" />
            </div>
        );
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Products"
                description="Manage your product inventory"
                actions={
                    <Button asChild>
                        <Link href="/admin/products/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                }
            />

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="rounded-md border border-destructive/50 p-4 bg-destructive/10 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {getColumnHeader('name', 'Product')}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    {getColumnHeader('price', 'Price')}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    {getColumnHeader('stock', 'Stock')}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Category
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 relative overflow-hidden rounded-md border bg-muted">
                                                    {product.images &&
                                                    product.images.length >
                                                        0 ? (
                                                        <Image
                                                            src={
                                                                product
                                                                    .images[0]
                                                            }
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium line-clamp-1">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {formatPrice(product.price)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {product.stock}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {product.category}
                                        </TableCell>
                                        <TableCell>
                                            {product.stock > 0 ? (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-green-50 text-green-700 border-green-200"
                                                >
                                                    In Stock
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 border-red-200"
                                                >
                                                    Out of Stock
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            target="_blank"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/admin/products/edit/${product.id}`}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No products found.{' '}
                                        <Link
                                            href="/admin/products/add"
                                            className="text-primary hover:underline"
                                        >
                                            Add your first product
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AdminLayout>
    );
}
