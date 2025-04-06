'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, KeyRound, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import {
    updateUserEmail,
    updateUserPassword,
    updateUserProfile,
} from '@/services/user-service';

const profileSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().optional(),
});

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required to update email'),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export function ProfileEditor() {
    const { user } = useAuth();
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: '', // Add user.phone if available
        },
    });

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: user?.email || '',
            password: '',
        },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
        if (!user) return;

        try {
            setIsUpdatingProfile(true);
            await updateUserProfile(user.id, data);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdateEmail = async (data: z.infer<typeof emailSchema>) => {
        if (!user) return;

        try {
            setIsUpdatingEmail(true);
            await updateUserEmail(data.email, data.password);
            toast.success('Email updated successfully');
            emailForm.reset({ email: data.email, password: '' });
        } catch (error) {
            console.error('Error updating email:', error);
            toast.error('Failed to update email. Check your password.');
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (
        data: z.infer<typeof passwordSchema>
    ) => {
        try {
            setIsUpdatingPassword(true);
            await updateUserPassword(data.currentPassword, data.newPassword);
            toast.success('Password updated successfully');
            passwordForm.reset();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(
                'Failed to update password. Check your current password.'
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <p>Please sign in to edit your profile.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Profile Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account information and security
                    </p>
                </div>

                <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>
            </div>

            <Tabs
                defaultValue="profile"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile Info</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your name and contact details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form
                                    id="profile-form"
                                    onSubmit={profileForm.handleSubmit(
                                        handleUpdateProfile
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="+1 (555) 123-4567"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    We will only use this for
                                                    order-related communications
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => profileForm.reset()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={
                                    isUpdatingProfile ||
                                    !profileForm.formState.isDirty
                                }
                            >
                                {isUpdatingProfile ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Email Tab */}
                <TabsContent value="email" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Address</CardTitle>
                            <CardDescription>
                                Update your email address. You will need to
                                verify the new email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...emailForm}>
                                <form
                                    id="email-form"
                                    onSubmit={emailForm.handleSubmit(
                                        handleUpdateEmail
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={emailForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    We need your password to
                                                    verify this change
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => emailForm.reset()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="email-form"
                                disabled={
                                    isUpdatingEmail ||
                                    !emailForm.formState.isDirty
                                }
                            >
                                {isUpdatingEmail ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Update Email
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <KeyRound className="mr-2 h-5 w-5 text-primary" />
                                Password
                            </CardTitle>
                            <CardDescription>
                                Change your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form
                                    id="password-form"
                                    onSubmit={passwordForm.handleSubmit(
                                        handleUpdatePassword
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    At least 8 characters with a
                                                    mix of letters, numbers &
                                                    symbols
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => passwordForm.reset()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="password-form"
                                disabled={
                                    isUpdatingPassword ||
                                    !passwordForm.formState.isDirty
                                }
                            >
                                {isUpdatingPassword ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <KeyRound className="mr-2 h-4 w-4" />
                                )}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
