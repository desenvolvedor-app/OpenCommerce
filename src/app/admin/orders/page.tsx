'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpDown,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Package,
  PackageCheck,
  Search,
  Trash,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHeader } from '@/components/admin/admin-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate, formatPrice } from '@/lib/utils';
import { getAllOrders, getOrderById, updateOrderStatus } from '@/services/order-service';
import { Order, OrderItem } from '@/types';

// Validation schema for order status update
const orderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

type OrderStatusFormValues = z.infer<typeof orderStatusSchema>;

export default function OrdersPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<OrderStatusFormValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: 'pending',
    },
  });

  // Fetch orders when component mounts
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const result = await getAllOrders();
        setOrders(result.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // View order details
  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await getOrderById(orderId);
      
      // Make sure order exists and has items property before setting
      if (order && order.items) {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
      } else {
        toast.error('Could not load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  // Update order status
  const handleUpdateStatus = async (values: OrderStatusFormValues) => {
    if (!selectedOrder) return;

    try {
      setOrderStatusLoading(true);

      // Update order status in the database
      await updateOrderStatus(selectedOrder.id, values.status);

      // Update order in local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: values.status }
            : order
        )
      );

      // Update selected order as well
      setSelectedOrder({ ...selectedOrder, status: values.status });

      toast.success(`Order status updated to ${values.status}`);
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setOrderStatusLoading(false);
    }
  };

  // Reset form when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      form.reset({ status: selectedOrder.status });
    }
  }, [selectedOrder, form]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus = !statusFilter || statusFilter === "all" || order.status === statusFilter;
  
    return matchesSearch && matchesStatus;
  });  

  return (
    <AdminLayout>
      <AdminHeader
        title="Orders"
        description="Manage and view customer orders"
      />

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by order ID or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
        <Select
        value={statusFilter || "all"}
        onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
            <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
          {statusFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatusFilter(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No orders found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter
              ? "Try adjusting your search or filter"
              : "Orders will appear here when customers make purchases"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium text-right">Total</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {order.shippingAddress.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Order Details Sheet */}
      <Sheet open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>
              Order Details #{selectedOrder?.id.slice(0, 8)}
            </SheetTitle>
            <SheetDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Order Status</h3>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Customer Information</h3>
                <div className="text-sm">
                  <p>
                    {selectedOrder.shippingAddress.firstName}{" "}
                    {selectedOrder.shippingAddress.lastName}
                  </p>
                  <p>{selectedOrder.shippingAddress.email}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Order Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Make sure items is an array before mapping */}
                      {Array.isArray(selectedOrder.items) ? selectedOrder.items.map(
                        (item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {item.productName}
                                </div>
                                {item.variantName && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.variantName}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(item.totalPrice)}
                            </TableCell>
                          </TableRow>
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No items available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Order Summary</h3>
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsStatusDialogOpen(true);
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Update Order Status Dialog */}
      <Dialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateStatus)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={orderStatusLoading}>
                  {orderStatusLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Order status badge component
function OrderStatusBadge({ status }: { status: Order['status'] }) {
  let color;
  let icon;

  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      icon = <Package className="mr-1 h-3 w-3" />;
      break;
    case 'processing':
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      icon = <Package className="mr-1 h-3 w-3" />;
      break;
    case 'shipped':
      color = 'bg-purple-100 text-purple-800 border-purple-200';
      icon = <Package className="mr-1 h-3 w-3" />;
      break;
    case 'delivered':
      color = 'bg-green-100 text-green-800 border-green-200';
      icon = <PackageCheck className="mr-1 h-3 w-3" />;
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800 border-red-200';
      icon = <X className="mr-1 h-3 w-3" />;
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      icon = <Package className="mr-1 h-3 w-3" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${color} flex items-center capitalize`}
          >
            {icon}
            {status}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">
            Order is {status}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
