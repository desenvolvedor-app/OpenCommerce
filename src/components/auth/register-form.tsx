'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/firebase/auth';

export function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptTerms) {
            toast.error('You must accept the terms and conditions to register');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password, name);
            toast.success('Account created successfully!');
            router.push('/account');
        } catch (error) {
            console.error('Error signing up:', error);
            toast.error('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 h-full px-3"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showPassword
                                        ? 'Hide password'
                                        : 'Show password'}
                                </span>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Password must be at least 8 characters long
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) =>
                                setAcceptTerms(checked === true)
                            }
                        />
                        <Label htmlFor="terms" className="text-sm leading-none">
                            I accept the{' '}
                            <Link
                                href="/terms"
                                className="text-primary hover:underline"
                            >
                                terms and conditions
                            </Link>
                        </Label>
                    </div>

                    <Button disabled={isLoading || !acceptTerms}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Account
                    </Button>
                </div>
            </form>

            <div className="text-center text-sm">
                Already have an account?{' '}
                <Link
                    href="/auth/login"
                    className="font-medium text-primary hover:underline"
                >
                    Sign in
                </Link>
            </div>
        </div>
    );
}
