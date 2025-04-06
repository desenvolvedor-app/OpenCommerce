'use client';

import { Eye, Loader2, Mail, MoreHorizontal, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { getAllUsers } from '@/services/user-service';
import { User } from '@/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchCustomers() {
            try {
                setIsLoading(true);
                const users = await getAllUsers();
                setCustomers(users);
            } catch (error) {
                console.error('Error fetching customers:', error);
                toast.error('Failed to load customers');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(
        (customer) =>
            (customer.name &&
                customer.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewOrders = (userId: string) => {
        // Implement view customer orders functionality
        toast.info('View orders feature coming soon');
    };

    const handleContactCustomer = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Customers"
                description="Manage your store customers"
            />

            <div className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                                        {customer.name
                                                            ? customer.name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : customer.email
                                                                  .charAt(0)
                                                                  .toUpperCase()}
                                                    </div>
                                                    <span>
                                                        {customer.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {customer.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        customer.role ===
                                                        'admin'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {customer.role === 'admin'
                                                        ? 'Admin'
                                                        : 'Customer'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {customer.createdAt
                                                    ? formatDate(
                                                          customer.createdAt
                                                      )
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleViewOrders(
                                                                    customer.id
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Orders
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleContactCustomer(
                                                                    customer.email
                                                                )
                                                            }
                                                        >
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Contact
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8"
                                        >
                                            No customers found.{' '}
                                            {searchTerm &&
                                                'Try a different search term.'}
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
