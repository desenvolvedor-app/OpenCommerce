import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
    title: 'Create an Account',
    description: 'Create a new account to start shopping',
};

export default function RegisterPage() {
    return (
        <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create an Account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Fill in the form below to create your account
                    </p>
                </div>
                <RegisterForm />
                <Link
                    href="/"
                    className="absolute left-4 top-4 md:left-8 md:top-8 text-sm flex items-center text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to home
                </Link>
            </div>
        </div>
    );
}
