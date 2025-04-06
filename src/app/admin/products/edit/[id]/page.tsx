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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCategories } from '@/services/category-service';
import {
    deleteProduct,
    getProductById,
    updateProduct,
} from '@/services/product-service';
import { Category, Product } from '@/types';

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

export default function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            sku: '',
            stock: 0,
            featured: false,
        },
    });

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);

                // Fetch product and categories in parallel
                const [productData, categoriesData] = await Promise.all([
                    getProductById(id),
                    getCategories(),
                ]);

                if (!productData) {
                    toast.error('Product not found');
                    router.push('/admin/products');
                    return;
                }

                setProduct(productData);
                setCategories(categoriesData);

                // Set existing images
                if (productData.images && productData.images.length > 0) {
                    setExistingImages(productData.images);
                }

                // Set form values
                form.reset({
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    category: productData.category,
                    sku: productData.sku || '',
                    stock: productData.stock,
                    featured: productData.featured || false,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [id, router, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages =
                existingImages.length -
                imagesToDelete.length +
                selectedImages.length +
                files.length;

            if (totalImages > 5) {
                toast.error('You can only upload up to 5 images in total');
                return;
            }

            const newFiles = [...selectedImages, ...files];
            setSelectedImages(newFiles);

            // Create preview URLs
            const newPreviewUrls = newFiles.map((file) =>
                URL.createObjectURL(file)
            );

            // Revoke old URLs to prevent memory leaks
            previewUrls.forEach((url) => URL.revokeObjectURL(url));

            setPreviewUrls(newPreviewUrls);
        }
    };

    const removeSelectedImage = (index: number) => {
        const newImages = [...selectedImages];
        const newPreviews = [...previewUrls];

        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setSelectedImages(newImages);
        setPreviewUrls(newPreviews);
    };

    const toggleExistingImageDelete = (imageUrl: string) => {
        if (imagesToDelete.includes(imageUrl)) {
            setImagesToDelete(imagesToDelete.filter((url) => url !== imageUrl));
        } else {
            // Don't allow deleting all images
            if (
                existingImages.length - imagesToDelete.length <= 1 &&
                selectedImages.length === 0
            ) {
                toast.error('You must keep at least one image');
                return;
            }
            setImagesToDelete([...imagesToDelete, imageUrl]);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!product) return;

        setIsSaving(true);

        try {
            const productData = {
                name: values.name,
                description: values.description,
                price: values.price,
                category: values.category,
                sku: values.sku,
                stock: values.stock,
                featured: values.featured,
            };

            await updateProduct(
                id,
                productData,
                selectedImages.length > 0 ? selectedImages : undefined,
                imagesToDelete.length > 0 ? imagesToDelete : undefined
            );

            toast.success('Product updated successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);

        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Loading product data...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Edit Product"
                description="Update product details"
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
                                        permanently delete the product and
                                        remove all associated data.
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
                            onClick={() => router.push('/admin/products')}
                            disabled={isSaving || isDeleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            form="edit-product-form"
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
                                id="edit-product-form"
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter product description"
                                                    {...field}
                                                    className="min-h-32"
                                                    disabled={isSaving}
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
                                                            disabled={isSaving}
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
                                                        disabled={isSaving}
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
                                                    disabled={isSaving}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.length >
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
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter SKU"
                                                        {...field}
                                                        disabled={isSaving}
                                                    />
                                                </FormControl>
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
                                                    disabled={isSaving}
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

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <>
                                    <h3 className="text-sm font-medium mb-2">
                                        Current Images
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
                                        {existingImages.map(
                                            (imageUrl, index) => (
                                                <div
                                                    key={`existing-${index}`}
                                                    className={`relative group aspect-square overflow-hidden rounded-md border ${
                                                        imagesToDelete.includes(
                                                            imageUrl
                                                        )
                                                            ? 'opacity-30 border-destructive'
                                                            : 'border-muted'
                                                    }`}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Product image ${index + 1}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            imagesToDelete.includes(
                                                                imageUrl
                                                            )
                                                                ? 'secondary'
                                                                : 'destructive'
                                                        }
                                                        size="icon"
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() =>
                                                            toggleExistingImageDelete(
                                                                imageUrl
                                                            )
                                                        }
                                                        disabled={isSaving}
                                                    >
                                                        {imagesToDelete.includes(
                                                            imageUrl
                                                        )
                                                            ? '↩'
                                                            : '×'}
                                                    </Button>
                                                    {index === 0 &&
                                                        !imagesToDelete.includes(
                                                            imageUrl
                                                        ) && (
                                                            <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs py-1 text-center">
                                                                Main Image
                                                            </span>
                                                        )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* New Image Upload */}
                            <div className="grid gap-4">
                                <div className="flex justify-center p-6 border-2 border-dashed rounded-md">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4 flex text-sm">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                                            >
                                                <span>Upload new images</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    disabled={isSaving}
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

                                {/* New Image Previews */}
                                {previewUrls.length > 0 && (
                                    <>
                                        <h3 className="text-sm font-medium mb-2">
                                            New Images
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                            {previewUrls.map((url, index) => (
                                                <div
                                                    key={`new-${index}`}
                                                    className="relative group aspect-square overflow-hidden rounded-md border bg-muted"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`New image ${index + 1}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() =>
                                                            removeSelectedImage(
                                                                index
                                                            )
                                                        }
                                                        disabled={isSaving}
                                                    >
                                                        &times;
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </FormItem>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
