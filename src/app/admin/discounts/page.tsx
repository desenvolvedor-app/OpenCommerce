'use client';

import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { Loader2, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { firestore } from '@/lib/firebase/firebase';

// Type definition for discounts
interface Discount {
    id: string;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    active: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newDiscount, setNewDiscount] = useState<
        Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>
    >({
        name: '',
        code: '',
        type: 'percentage',
        value: 10,
        active: true,
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setIsLoading(true);
            const q = query(
                collection(firestore, 'discounts'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            const discountList: Discount[] = [];
            querySnapshot.forEach((doc) => {
                discountList.push({ id: doc.id, ...doc.data() } as Discount);
            });

            setDiscounts(discountList);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            toast.error('Failed to load discounts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            const discount = discounts.find((d) => d.id === id);
            if (!discount) return;

            const newStatus = !discount.active;
            await updateDoc(doc(firestore, 'discounts', id), {
                active: newStatus,
                updatedAt: serverTimestamp(),
            });

            setDiscounts(
                discounts.map((discount) =>
                    discount.id === id
                        ? { ...discount, active: newStatus }
                        : discount
                )
            );

            toast.success(
                `Discount ${newStatus ? 'activated' : 'deactivated'}`
            );
        } catch (error) {
            console.error('Error updating discount:', error);
            toast.error('Failed to update discount status');
        }
    };

    const handleCreateDiscount = async () => {
        if (!newDiscount.name || !newDiscount.code) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSaving(true);

            // Create a unique ID
            const id = Date.now().toString();
            const discountRef = doc(firestore, 'discounts', id);

            await setDoc(discountRef, {
                ...newDiscount,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Add to local state
            setDiscounts([
                {
                    id,
                    ...newDiscount,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                ...discounts,
            ]);

            // Reset form and close dialog
            setNewDiscount({
                name: '',
                code: '',
                type: 'percentage',
                value: 10,
                active: true,
            });
            setIsDialogOpen(false);

            toast.success('Discount created successfully');
        } catch (error) {
            console.error('Error creating discount:', error);
            toast.error('Failed to create discount');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Discount Management"
                description="Create and manage promotional discounts"
                actions={
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Create New Discount</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Discount</DialogTitle>
                                <DialogDescription>
                                    Set up a new promotional discount for your
                                    store.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Discount Name</Label>
                                    <Input
                                        id="name"
                                        value={newDiscount.name}
                                        onChange={(e) =>
                                            setNewDiscount({
                                                ...newDiscount,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Summer Sale"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Discount Code</Label>
                                    <Input
                                        id="code"
                                        value={newDiscount.code}
                                        onChange={(e) =>
                                            setNewDiscount({
                                                ...newDiscount,
                                                code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="SUMMER25"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Discount Type</Label>
                                    <Select
                                        value={newDiscount.type}
                                        onValueChange={(
                                            value: 'percentage' | 'fixed'
                                        ) =>
                                            setNewDiscount({
                                                ...newDiscount,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">
                                                Percentage
                                            </SelectItem>
                                            <SelectItem value="fixed">
                                                Fixed Amount
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">
                                        {newDiscount.type === 'percentage'
                                            ? 'Percentage (%)'
                                            : 'Amount ($)'}
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={newDiscount.value}
                                        onChange={(e) =>
                                            setNewDiscount({
                                                ...newDiscount,
                                                value: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        min={0}
                                        max={
                                            newDiscount.type === 'percentage'
                                                ? 100
                                                : undefined
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateDiscount}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Discount'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Active Discounts</CardTitle>
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
                                    <TableHead>Discount Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.length > 0 ? (
                                    discounts.map((discount) => (
                                        <TableRow key={discount.id}>
                                            <TableCell className="font-medium">
                                                {discount.name}
                                            </TableCell>
                                            <TableCell>
                                                <code className="bg-muted px-1 py-0.5 rounded text-sm">
                                                    {discount.code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {discount.type === 'percentage'
                                                    ? 'Percentage'
                                                    : 'Fixed Amount'}
                                            </TableCell>
                                            <TableCell>
                                                {discount.type === 'percentage'
                                                    ? `${discount.value}%`
                                                    : `$${discount.value.toFixed(2)}`}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Switch
                                                        checked={
                                                            discount.active
                                                        }
                                                        onCheckedChange={() =>
                                                            handleToggleActive(
                                                                discount.id
                                                            )
                                                        }
                                                    />
                                                    <span className="ml-2 text-sm">
                                                        {discount.active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8"
                                        >
                                            No discounts found. Create your
                                            first discount to get started.
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
