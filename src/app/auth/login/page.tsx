import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your account',
};

export default function LoginPage() {
    return (
        <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sign In
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and password to access your account
                    </p>
                </div>
                <LoginForm />
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
