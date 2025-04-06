'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getProducts, updateProduct } from '@/services/product-service';
import { Product } from '@/types';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingProductId, setUpdatingProductId] = useState<string | null>(
        null
    );
    const [stockUpdates, setStockUpdates] = useState<{ [key: string]: number }>(
        {}
    );

    useEffect(() => {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                const { products: fetchedProducts } = await getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                toast.error('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const handleStockChange = (productId: string, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            setStockUpdates({
                ...stockUpdates,
                [productId]: numValue,
            });
        }
    };

    const handleUpdateStock = async (productId: string) => {
        if (stockUpdates[productId] === undefined) return;

        try {
            setUpdatingProductId(productId);
            await updateProduct(productId, { stock: stockUpdates[productId] });

            // Update local state
            setProducts(
                products.map((p) =>
                    p.id === productId
                        ? { ...p, stock: stockUpdates[productId] }
                        : p
                )
            );

            // Clear the update
            const { [productId]: _, ...rest } = stockUpdates;
            setStockUpdates(rest);

            toast.success('Inventory updated successfully');
        } catch (error) {
            console.error('Error updating inventory:', error);
            toast.error('Failed to update inventory');
        } finally {
            setUpdatingProductId(null);
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <AdminHeader
                title="Inventory Management"
                description="Manage product stock levels"
            />

            <div className="mb-6">
                <div className="flex gap-2">
                    <Input
                        className="max-w-md"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Update Stock</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>
                                                {product.stock}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-24"
                                                    placeholder={product.stock.toString()}
                                                    onChange={(e) =>
                                                        handleStockChange(
                                                            product.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        stockUpdates[
                                                            product.id
                                                        ] === undefined
                                                            ? ''
                                                            : stockUpdates[
                                                                  product.id
                                                              ]
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        stockUpdates[
                                                            product.id
                                                        ] === undefined ||
                                                        updatingProductId ===
                                                            product.id
                                                    }
                                                    onClick={() =>
                                                        handleUpdateStock(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    {updatingProductId ===
                                                    product.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    ) : (
                                                        'Update'
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8"
                                        >
                                            No products found.{' '}
                                            {searchTerm &&
                                                'Try a different search term.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
