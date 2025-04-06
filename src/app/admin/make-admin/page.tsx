'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { makeUserAdmin } from '@/lib/firebase/auth';

export default function MakeAdminPage() {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleMakeAdmin = async () => {
        if (!userId) {
            toast.error('Please enter a user ID');
            return;
        }

        setIsLoading(true);
        try {
            await makeUserAdmin(userId);
            toast.success('User has been granted admin privileges');
            setUserId('');
        } catch (error) {
            console.error('Error making user admin:', error);
            toast.error('Failed to update user role');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Grant Admin Access"
                description="Promote a user to admin role"
            />

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Make User Admin</CardTitle>
                    <CardDescription>
                        Enter a user ID to grant them administrative privileges
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Enter user ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Note: This will give the user full access to the
                                admin dashboard and all administrative
                                functions.
                            </p>
                        </div>
                        <Button
                            onClick={handleMakeAdmin}
                            disabled={isLoading || !userId}
                            className="w-full"
                        >
                            {isLoading ? 'Processing...' : 'Grant Admin Access'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
