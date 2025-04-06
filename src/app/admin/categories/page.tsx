'use client';

import {
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { deleteCategory, getCategories } from '@/services/category-service';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setIsLoading(true);
                const result = await getCategories();
                setCategories(result || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories. Please try again.');
                toast.error('Failed to load categories');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            setIsDeleting(true);
            await deleteCategory(categoryToDelete.id);
            setCategories(
                categories.filter((cat) => cat.id !== categoryToDelete.id)
            );
            toast.success(
                `Category ${categoryToDelete.name} deleted successfully`
            );
            setCategoryToDelete(null);
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Categories"
                description="Manage your product categories"
                actions={
                    <Button asChild>
                        <Link href="/admin/categories/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
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
                                <TableHead>Category</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Slug
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Description
                                </TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 relative overflow-hidden rounded-md border bg-muted">
                                                    {category.image ? (
                                                        <Image
                                                            src={category.image}
                                                            alt={category.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {category.slug}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell line-clamp-1">
                                            {category.description ||
                                                'No description'}
                                        </TableCell>
                                        <TableCell>
                                            {category.featured ? (
                                                <Badge>Featured</Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Not Featured
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
                                                            href={`/categories/${category.slug}`}
                                                            target="_blank"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/admin/categories/edit/${category.id}`}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                            setCategoryToDelete(
                                                                category
                                                            )
                                                        }
                                                    >
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
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        No categories found.{' '}
                                        <Link
                                            href="/admin/categories/add"
                                            className="text-primary hover:underline"
                                        >
                                            Add your first category
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the category{' '}
                            {categoryToDelete?.name}. Products associated with
                            this category will not be deleted, but they will no
                            longer be categorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteCategory}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
