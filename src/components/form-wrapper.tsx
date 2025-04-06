import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

interface FormWrapperProps {
    methods: UseFormReturn<any>;
    children: React.ReactNode;
    onSubmit?: (data: any) => void;
    className?: string;
}

export function FormWrapper({
    methods,
    children,
    onSubmit,
    className,
}: FormWrapperProps) {
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined}
                className={className}
            >
                {children}
            </form>
        </FormProvider>
    );
}
