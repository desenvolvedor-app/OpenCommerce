// User related types
export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'customer';
    createdAt?: any;
    updatedAt?: any;
}

// Product related types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    images: string[];
    category: string;
    sku: string;
    stock: number;
    featured?: boolean;
    slug: string;
    createdAt: any;
    updatedAt: any;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    slug: string;
    image?: string;
    featured?: boolean;
    createdAt?: any;
    updatedAt?: any;
}

// Cart related types
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
        id: string;
        name: string;
    };
}

// Order related types
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
    createdAt: any;
}

export interface OrderItem {
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variantId?: string;
    variantName?: string;
}

export interface Address {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type?: 'shipping' | 'billing' | 'both';
    isDefault?: boolean;
}
