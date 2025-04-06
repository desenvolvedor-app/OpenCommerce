'use client';

import { CheckCircle, Home, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AddressForm } from '@/components/account/address-form';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COUNTRIES } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import {
    addAddress,
    deleteAddress,
    getUserAddresses,
    setDefaultAddress,
    updateAddress,
} from '@/services/address-service';
import { Address } from '@/types';

export function AddressBook() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'shipping' | 'billing'>(
        'all'
    );

    useEffect(() => {
        async function fetchAddresses() {
            if (!user) return;

            try {
                setIsLoading(true);
                const userAddresses = await getUserAddresses(user.id);
                setAddresses(userAddresses);
            } catch (error) {
                console.error('Error fetching addresses:', error);
                toast.error('Failed to load addresses');
            } finally {
                setIsLoading(false);
            }
        }

        fetchAddresses();
    }, [user]);

    const handleAddAddress = async (address: Omit<Address, 'id'>) => {
        if (!user) return;

        try {
            setIsSubmitting(true);
            const addressId = await addAddress(user.id, address);

            // If set as default, update in the database
            if (address.isDefault) {
                await setDefaultAddress(user.id, addressId);
            }

            // Add to local state
            const newAddress = { ...address, id: addressId, isDefault: !!address.isDefault };

            // If it's the default address, update other addresses isDefault property
            if (address.isDefault) {
                setAddresses((prevAddresses) =>
                    prevAddresses
                        .map((addr) => ({
                            ...addr,
                            isDefault: false,
                        }))
                        .concat([newAddress])
                );
            } else {
                setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
            }

            setIsAddingAddress(false);
            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Failed to add address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAddress = async (address: Address) => {
        if (!user) return;

        try {
            setIsSubmitting(true);
            await updateAddress(user.id, address.id, address);

            // If set as default, update in the database
            if (address.isDefault) {
                await setDefaultAddress(user.id, address.id);
            }

            // Update local state
            if (address.isDefault) {
                setAddresses((prevAddresses) =>
                    prevAddresses.map((addr) => ({
                        ...addr,
                        isDefault: addr.id === address.id,
                    }))
                );
            } else {
                setAddresses((prevAddresses) =>
                    prevAddresses.map((addr) =>
                        addr.id === address.id ? address : addr
                    )
                );
            }

            setEditingAddress(null);
            toast.success('Address updated successfully');
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;

        try {
            await deleteAddress(user.id, addressId);

            // Update local state
            setAddresses((prevAddresses) =>
                prevAddresses.filter((addr) => addr.id !== addressId)
            );

            toast.success('Address deleted successfully');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefaultAddress = async (addressId: string) => {
        if (!user) return;

        try {
            await setDefaultAddress(user.id, addressId);

            // Update local state
            setAddresses((prevAddresses) =>
                prevAddresses.map((addr) => ({
                    ...addr,
                    isDefault: addr.id === addressId,
                }))
            );

            toast.success('Default address updated');
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to set default address');
        }
    };

    // Get country name from country code
    const getCountryName = (countryCode: string) => {
        const country = COUNTRIES.find((c) => c.code === countryCode);
        return country ? country.name : countryCode;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAddingAddress || editingAddress) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {isAddingAddress ? 'Add New Address' : 'Edit Address'}
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setIsAddingAddress(false);
                            setEditingAddress(null);
                        }}
                    >
                        Cancel
                    </Button>
                </div>

                <AddressForm
                    address={editingAddress || undefined}
                    onSubmit={
                        editingAddress ? handleUpdateAddress : handleAddAddress
                    }
                    isSubmitting={isSubmitting}
                    onCancel={() => {
                        setIsAddingAddress(false);
                        setEditingAddress(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Address Book</h2>
                <Button onClick={() => setIsAddingAddress(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">
                        No addresses saved
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        Add a new address to speed up your checkout process.
                    </p>
                    <Button
                        onClick={() => setIsAddingAddress(true)}
                        className="mt-6"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Address
                    </Button>
                </div>
            ) : (
                <>
                    <Tabs
                        defaultValue="all"
                        onValueChange={(value) => setActiveTab(value as any)}
                    >
                        <TabsList>
                            <TabsTrigger value="all">All Addresses</TabsTrigger>
                            <TabsTrigger value="shipping">Shipping</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {addresses.map((address) => (
                                    <AddressCard
                                        key={address.id}
                                        address={address}
                                        onEdit={() =>
                                            setEditingAddress(address)
                                        }
                                        onDelete={() =>
                                            handleDeleteAddress(address.id)
                                        }
                                        onSetDefault={() =>
                                            handleSetDefaultAddress(address.id)
                                        }
                                        getCountryName={getCountryName}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="shipping" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {addresses
                                    .filter(
                                        (a) => a.type === 'shipping' || !a.type
                                    )
                                    .map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={() =>
                                                setEditingAddress(address)
                                            }
                                            onDelete={() =>
                                                handleDeleteAddress(address.id)
                                            }
                                            onSetDefault={() =>
                                                handleSetDefaultAddress(
                                                    address.id
                                                )
                                            }
                                            getCountryName={getCountryName}
                                        />
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="billing" className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {addresses
                                    .filter(
                                        (a) => a.type === 'billing' || !a.type
                                    )
                                    .map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={() =>
                                                setEditingAddress(address)
                                            }
                                            onDelete={() =>
                                                handleDeleteAddress(address.id)
                                            }
                                            onSetDefault={() =>
                                                handleSetDefaultAddress(
                                                    address.id
                                                )
                                            }
                                            getCountryName={getCountryName}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}

// Address Card Component
function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    getCountryName,
}: {
    address: Address;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
    getCountryName: (code: string) => string;
}) {
    return (
        <Card
            key={address.id}
            className={address.isDefault ? 'border-primary' : ''}
        >
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                    <CardTitle>
                        {address.firstName} {address.lastName}
                        {address.isDefault && (
                            <span className="ml-2 inline-flex items-center text-sm font-medium text-primary">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Default
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>{address.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-1 text-sm">
                    <p>{address.address}</p>
                    <p>
                        {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{getCountryName(address.country)}</p>
                    <p className="pt-2">Phone: {address.phone}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>

                    {!address.isDefault && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSetDefault}
                        >
                            Set as Default
                        </Button>
                    )}
                </div>

                {!address.isDefault && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this address.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    );
}
