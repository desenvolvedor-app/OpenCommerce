'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
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
import { addCategory } from '@/services/category-service';

// Define the Zod schema with proper types
const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Category name must be at least 2 characters' }),
    description: z.string().optional(),
    featured: z.boolean(),
});

// Create a type for the form values based on the Zod schema
type FormValues = z.infer<typeof formSchema>;

export default function AddCategoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            featured: false,
        },
    });

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

    async function onSubmit(values: FormValues) {
        setIsLoading(true);

        try {
            const categoryData = {
                name: values.name,
                description: values.description || '',
                featured: values.featured,
            };

            // Add the category with optional image
            await addCategory(categoryData, selectedImage || undefined);

            toast.success('Category added successfully!');
            router.push('/admin/categories');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Add Category"
                description="Create a new product category"
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/categories')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="add-category-form"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Category'
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
                                id="add-category-form"
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
                                                    disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                Upload an image to represent this category.
                            </FormDescription>

                            <div className="grid gap-4">
                                <div className="flex justify-center p-6 border-2 border-dashed rounded-md">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4 flex text-sm">
                                            <label
                                                htmlFor="category-image"
                                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                                            >
                                                <span>Upload an image</span>
                                                <input
                                                    id="category-image"
                                                    name="category-image"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    disabled={isLoading}
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

                                {previewUrl && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">
                                            Image Preview
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
                                                disabled={isLoading}
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
