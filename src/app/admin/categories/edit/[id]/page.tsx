'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    deleteCategory,
    getCategoryById,
    updateCategory,
} from '@/services/category-service';
import { Category } from '@/types';

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Category name must be at least 2 characters' }),
    description: z.string().optional(),
    featured: z.boolean(),
});

export default function EditCategoryPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            featured: false,
        },
    });

    useEffect(() => {
        async function fetchCategory() {
            try {
                setIsLoading(true);
                const categoryData = await getCategoryById(id);

                if (!categoryData) {
                    toast.error('Category not found');
                    router.push('/admin/categories');
                    return;
                }

                setCategory(categoryData);

                // Set form values
                form.reset({
                    name: categoryData.name,
                    description: categoryData.description || '',
                    featured: categoryData.featured || false,
                });
            } catch (error) {
                console.error('Error fetching category:', error);
                toast.error('Failed to load category data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategory();
    }, [id, router, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Revoke the previous preview URL to prevent memory leaks
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!category) return;

        setIsSaving(true);

        try {
            const categoryData = {
                name: values.name,
                description: values.description || '',
                featured: values.featured,
            };

            await updateCategory(id, categoryData, selectedImage || undefined);

            toast.success('Category updated successfully');
            router.push('/admin/categories');
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);

        try {
            await deleteCategory(id);
            toast.success('Category deleted successfully');
            router.push('/admin/categories');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Loading category data...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Edit Category"
                description="Update category details"
                actions={
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={isSaving || isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the category and may
                                        affect products assigned to this
                                        category.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/categories')}
                            disabled={isSaving || isDeleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            form="edit-category-form"
                            disabled={isSaving || isDeleting}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form
                                id="edit-category-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter category name"
                                                    {...field}
                                                    disabled={isSaving}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter category description"
                                                    {...field}
                                                    className="min-h-20"
                                                    disabled={isSaving}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="featured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                    disabled={isSaving}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Featured Category
                                                </FormLabel>
                                                <FormDescription>
                                                    This category will be
                                                    displayed on the homepage
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <FormItem>
                            <FormLabel>Category Image</FormLabel>
                            <FormDescription className="mb-4">
                                Upload a new image or keep the current one.
                            </FormDescription>

                            {/* Current Image */}
                            {category?.image && !previewUrl && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium mb-2">
                                        Current Image
                                    </p>
                                    <div className="relative aspect-video rounded-md border overflow-hidden bg-muted">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="grid gap-4">
                                <div className="flex justify-center p-6 border-2 border-dashed rounded-md">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4 flex text-sm">
                                            <label
                                                htmlFor="category-image"
                                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                                            >
                                                <span>Upload a new image</span>
                                                <input
                                                    id="category-image"
                                                    name="category-image"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    disabled={isSaving}
                                                />
                                            </label>
                                            <p className="pl-1 text-muted-foreground">
                                                or drag and drop
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>

                                {/* New Image Preview */}
                                {previewUrl && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">
                                            New Image Preview
                                        </p>
                                        <div className="relative aspect-video rounded-md border overflow-hidden bg-muted">
                                            <img
                                                src={previewUrl}
                                                alt="Category preview"
                                                className="object-cover w-full h-full"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    URL.revokeObjectURL(
                                                        previewUrl
                                                    );
                                                    setPreviewUrl(null);
                                                    setSelectedImage(null);
                                                }}
                                                disabled={isSaving}
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormItem>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
