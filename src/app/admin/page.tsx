'use client';

import {
    DollarSign,
    Loader2,
    Package,
    Plus,
    ShoppingBag,
    Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getCategories } from '@/services/category-service';
import { getProducts } from '@/services/product-service';

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        outOfStock: 0,
        totalCategories: 0,
        totalSales: 0,
    });

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setIsLoading(true);

                // Fetch products and categories
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);

                // Calculate stats
                const allProducts = productsData.products || [];
                const outOfStockProducts = allProducts.filter(
                    (p) => p.stock <= 0
                );

                setStats({
                    totalProducts: allProducts.length,
                    outOfStock: outOfStockProducts.length,
                    totalCategories: categoriesData?.length || 0,
                    totalSales: 0, // This would normally come from an orders API
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Dashboard"
                description="Overview of your store"
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-10 w-10 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Products
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalProducts}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Package className="h-10 w-10 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Out of Stock
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.outOfStock}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Tag className="h-10 w-10 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Categories
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalCategories}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-10 w-10 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Sales
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {formatPrice(stats.totalSales)}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks you might want to perform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Button asChild className="h-auto py-4 justify-start">
                            <Link href="/admin/products/add">
                                <Plus className="mr-2 h-5 w-5" />
                                Add New Product
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-auto py-4 justify-start"
                        >
                            <Link href="/admin/categories/add">
                                <Plus className="mr-2 h-5 w-5" />
                                Add New Category
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="secondary"
                            className="h-auto py-4 justify-start"
                        >
                            <Link href="/" target="_blank">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                View Store
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <Card>
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                        Essential steps to set up your store
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 text-primary rounded-full p-2">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium">Add Products</h4>
                                <p className="text-muted-foreground">
                                    Start by adding products to your store
                                    inventory.
                                </p>
                                <Button
                                    asChild
                                    variant="link"
                                    className="p-0 h-auto mt-1"
                                >
                                    <Link href="/admin/products/add">
                                        Add Your First Product
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 text-primary rounded-full p-2">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium">
                                    Organize Categories
                                </h4>
                                <p className="text-muted-foreground">
                                    Create categories to organize your products.
                                </p>
                                <Button
                                    asChild
                                    variant="link"
                                    className="p-0 h-auto mt-1"
                                >
                                    <Link href="/admin/categories">
                                        Manage Categories
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
