'use client';

import {
    AlertTriangle,
    CheckCircle,
    CreditCard,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PaymentMethodForm } from '@/components/account/payment-method-form';
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
import { PAYMENT_CARD_TYPES } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import {
    addPaymentMethod,
    getUserPaymentMethods,
    removePaymentMethod,
    setDefaultPaymentMethod,
} from '@/services/payment-service';

export interface PaymentMethod {
    id: string;
    cardNumber: string; // Last 4 digits
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
}

export function PaymentMethods() {
    const { user } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchPaymentMethods() {
            if (!user) return;

            try {
                setIsLoading(true);
                const methods = await getUserPaymentMethods(user.id);
                setPaymentMethods(methods);
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                toast.error('Failed to load payment methods');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPaymentMethods();
    }, [user]);

    const handleAddPaymentMethod = async (paymentDetails: any) => {
        if (!user) return;

        try {
            setIsSubmitting(true);

            // Extract last 4 digits of the card number
            const cardNumber = paymentDetails.cardNumber
                .replace(/\s/g, '')
                .slice(-4);

            const newMethod = {
                cardNumber,
                cardBrand: paymentDetails.cardType,
                expiryMonth: paymentDetails.expiryMonth,
                expiryYear: paymentDetails.expiryYear,
                isDefault: paymentDetails.isDefault,
            };

            const id = await addPaymentMethod(user.id, newMethod);

            // Update local state
            const methodWithId = { id, ...newMethod };

            if (paymentDetails.isDefault) {
                setPaymentMethods((prevMethods) =>
                    prevMethods
                        .map((method) => ({
                            ...method,
                            isDefault: false,
                        }))
                        .concat([methodWithId])
                );
            } else {
                setPaymentMethods((prevMethods) => [
                    ...prevMethods,
                    methodWithId,
                ]);
            }

            setIsAddingMethod(false);
            toast.success('Payment method added successfully');
        } catch (error) {
            console.error('Error adding payment method:', error);
            toast.error('Failed to add payment method');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemovePaymentMethod = async (id: string) => {
        if (!user) return;

        try {
            await removePaymentMethod(user.id, id);

            setPaymentMethods((prevMethods) =>
                prevMethods.filter((method) => method.id !== id)
            );

            toast.success('Payment method removed');
        } catch (error) {
            console.error('Error removing payment method:', error);
            toast.error('Failed to remove payment method');
        }
    };

    const handleSetDefaultMethod = async (id: string) => {
        if (!user) return;

        try {
            await setDefaultPaymentMethod(user.id, id);

            setPaymentMethods((prevMethods) =>
                prevMethods.map((method) => ({
                    ...method,
                    isDefault: method.id === id,
                }))
            );

            toast.success('Default payment method updated');
        } catch (error) {
            console.error('Error setting default payment method:', error);
            toast.error('Failed to set default payment method');
        }
    };

    // Get card brand name (Visa, Mastercard, etc.)
    const getCardBrandName = (cardType: string) => {
        const type = PAYMENT_CARD_TYPES.find((t) => t.id === cardType);
        return type ? type.name : cardType;
    };

    // Get card brand icon class (for styling)
    const getCardBrandClass = (cardType: string) => {
        switch (cardType) {
            case 'visa':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'mastercard':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'amex':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'discover':
                return 'bg-violet-50 text-violet-700 border-violet-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAddingMethod) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Add Payment Method</h2>
                    <Button
                        variant="ghost"
                        onClick={() => setIsAddingMethod(false)}
                    >
                        Cancel
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Card Details</CardTitle>
                        <CardDescription>
                            Enter your payment information below. Your card
                            details are securely processed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentMethodForm
                            onSubmit={handleAddPaymentMethod}
                            isSubmitting={isSubmitting}
                            onCancel={() => setIsAddingMethod(false)}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Payment Methods</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your payment methods and defaults
                    </p>
                </div>
                <Button onClick={() => setIsAddingMethod(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                </Button>
            </div>

            {paymentMethods.length === 0 ? (
                <Card className="flex flex-col items-center text-center py-10 px-6">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <CreditCard className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">
                        No payment methods saved
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md">
                        Add a payment method to speed up your checkout process.
                        We securely store your payment information for future
                        purchases.
                    </p>
                    <Button onClick={() => setIsAddingMethod(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment Method
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {paymentMethods.map((method) => (
                        <Card
                            key={method.id}
                            className={`overflow-hidden transition-all ${method.isDefault ? 'border-primary' : ''}`}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCardBrandClass(method.cardBrand)}`}
                                            >
                                                {getCardBrandName(
                                                    method.cardBrand
                                                )}
                                            </span>
                                            {method.isDefault && (
                                                <span className="ml-2 inline-flex items-center text-xs font-medium text-green-600">
                                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="mt-2 text-lg">
                                            •••• •••• •••• {method.cardNumber}
                                        </CardTitle>
                                    </div>

                                    {/* Placeholder for card brand logo */}
                                    <div
                                        className={`h-10 w-16 rounded border grid place-items-center text-xs font-medium ${getCardBrandClass(method.cardBrand)}`}
                                    >
                                        {getCardBrandName(method.cardBrand)
                                            .substring(0, 4)
                                            .toUpperCase()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-sm">
                                    <p>
                                        Expires: {method.expiryMonth}/
                                        {method.expiryYear}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-0 gap-2">
                                {!method.isDefault && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() =>
                                            handleSetDefaultMethod(method.id)
                                        }
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Set as Default
                                    </Button>
                                )}

                                {!method.isDefault && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                    Remove Payment Method?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently remove this
                                                    payment method from your
                                                    account.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleRemovePaymentMethod(
                                                            method.id
                                                        )
                                                    }
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Security notice */}
            <div className="flex items-start gap-3 mt-8 p-4 bg-muted/50 rounded-lg text-sm">
                <div className="rounded-full bg-muted p-1.5 mt-0.5">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium">Secure Payment Storage</p>
                    <p className="text-muted-foreground mt-1">
                        Your payment information is securely stored by our
                        payment processor and never touches our servers. We use
                        industry-standard encryption to protect your data.
                    </p>
                </div>
            </div>
        </div>
    );
}
