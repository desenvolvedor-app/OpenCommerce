'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
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
import { MONTHS, PAYMENT_CARD_TYPES, YEARS } from '@/lib/constants';

const paymentMethodSchema = z.object({
    cardNumber: z
        .string()
        .min(13, 'Card number must be at least 13 digits')
        .max(19, 'Card number must be at most 19 digits')
        .regex(/^\d+$/, 'Card number must contain only digits'),
    cardHolder: z.string().min(2, 'Cardholder name is required'),
    expiryMonth: z.string().min(1, 'Expiry month is required'),
    expiryYear: z.string().min(1, 'Expiry year is required'),
    cvv: z
        .string()
        .min(3, 'CVV must be at least 3 digits')
        .max(4, 'CVV must be at most 4 digits')
        .regex(/^\d+$/, 'CVV must contain only digits'),
    cardType: z.string().min(1, 'Card type is required'),
    isDefault: z.boolean().optional(),
});

interface PaymentMethodFormProps {
    onSubmit: (data: z.infer<typeof paymentMethodSchema>) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

export function PaymentMethodForm({
    onSubmit,
    isSubmitting = false,
    onCancel,
}: PaymentMethodFormProps) {
    const form = useForm<z.infer<typeof paymentMethodSchema>>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            cardNumber: '',
            cardHolder: '',
            expiryMonth: MONTHS[0].value,
            expiryYear: YEARS[0].value,
            cvv: '',
            cardType: PAYMENT_CARD_TYPES[0].id,
            isDefault: false,
        },
    });

    // Format card number as the user types
    const formatCardNumber = (value: string) => {
        const val = value.replace(/\D/g, '');
        // Add space after every 4 digits
        const formatted = val.replace(/(.{4})/g, '$1 ').trim();
        return formatted;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCardNumber(e.target.value);
        form.setValue('cardNumber', formattedValue);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="cardType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Card Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select card type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {PAYMENT_CARD_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        placeholder="•••• •••• •••• ••••"
                                        {...field}
                                        value={field.value}
                                        onChange={handleCardNumberChange}
                                        maxLength={19} // 16 digits + 3 spaces
                                    />
                                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cardHolder"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FormLabel>Expiration Date</FormLabel>
                        <div className="flex space-x-4">
                            <FormField
                                control={form.control}
                                name="expiryMonth"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {MONTHS.map((month) => (
                                                    <SelectItem
                                                        key={month.value}
                                                        value={month.value}
                                                    >
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expiryYear"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {YEARS.map((year) => (
                                                    <SelectItem
                                                        key={year.value}
                                                        value={year.value}
                                                    >
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="•••"
                                        maxLength={4}
                                        {...field}
                                        onChange={(e) => {
                                            // Only allow digits
                                            const value =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                );
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Set as default payment method
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    This payment method will be used by default
                                    during checkout
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Card
                    </Button>
                </div>
            </form>
        </Form>
    );
}
