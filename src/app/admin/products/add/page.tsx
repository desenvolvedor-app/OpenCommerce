'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCategories } from '@/services/category-service';
import { addProduct } from '@/services/product-service';
import { Category } from '@/types';

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Product name must be at least 2 characters' }),
    description: z
        .string()
        .min(10, { message: 'Description must be at least 10 characters' }),
    price: z.coerce.number().positive({ message: 'Price must be positive' }),
    category: z.string().min(1, { message: 'Please select a category' }),
    sku: z.string().optional(),
    stock: z.coerce
        .number()
        .int()
        .nonnegative({ message: 'Stock must be a non-negative integer' }),
    featured: z.boolean(),
});

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setIsLoadingCategories(true);
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories. Please try again.');
            } finally {
                setIsLoadingCategories(false);
            }
        }

        fetchCategories();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            sku: '',
            stock: 1,
            featured: false,
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFiles = [...selectedImages, ...files];

            // Limit to 5 images
            const limitedFiles = newFiles.slice(0, 5);
            setSelectedImages(limitedFiles);

            // Create preview URLs
            const urls = limitedFiles.map((file) => URL.createObjectURL(file));

            // Revoke old URLs to prevent memory leaks
            previewUrls.forEach((url) => URL.revokeObjectURL(url));

            setPreviewUrls(urls);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        const newPreviews = [...previewUrls];

        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setSelectedImages(newImages);
        setPreviewUrls(newPreviews);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const productData = {
                name: values.name,
                description: values.description,
                price: values.price,
                category: values.category,
                sku: values.sku || `SKU-${Date.now().toString(36)}`, // Generate a SKU if not provided
                stock: values.stock,
                featured: values.featured,
                images: [], // Will be populated by the service
            };

            const productId = await addProduct(productData, selectedImages);

            toast.success('Product added successfully!');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Add Product"
                description="Create a new product in your store"
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/products')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="add-product-form"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Product'}
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form
                                id="add-product-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter product name"
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter product description"
                                                    {...field}
                                                    className="min-h-32"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                            $
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="pl-6"
                                                            placeholder="0.00"
                                                            {...field}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder="0"
                                                        {...field}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                    disabled={
                                                        isLoading ||
                                                        isLoadingCategories
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingCategories ? (
                                                            <SelectItem
                                                                value="loading"
                                                                disabled
                                                            >
                                                                Loading
                                                                categories...
                                                            </SelectItem>
                                                        ) : categories.length >
                                                          0 ? (
                                                            categories.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.slug
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )
                                                        ) : (
                                                            <SelectItem
                                                                value="no-categories"
                                                                disabled
                                                            >
                                                                No categories
                                                                found
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    SKU (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter SKU"
                                                        {...field}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave empty to auto-generate
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                                    Featured Product
                                                </FormLabel>
                                                <FormDescription>
                                                    This product will be
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
                            <FormLabel>Product Images</FormLabel>
                            <FormDescription className="mb-4">
                                Upload up to 5 images for your product. First
                                image will be used as the main image.
                            </FormDescription>

                            <div className="grid gap-4">
                                <div className="flex justify-center p-6 border-2 border-dashed rounded-md">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4 flex text-sm">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                                            >
                                                <span>Upload images</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    disabled={
                                                        isLoading ||
                                                        selectedImages.length >=
                                                            5
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1 text-muted-foreground">
                                                or drag and drop
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                </div>

                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {previewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group aspect-square overflow-hidden rounded-md border bg-muted"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    &times;
                                                </Button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs py-1 text-center">
                                                        Main Image
                                                    </span>
                                                )}
                                            </div>
                                        ))}
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
