import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    QueryConstraint,
    serverTimestamp,
    startAfter,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { firestore } from '@/lib/firebase/firebase';
import { Order } from '@/types';

const ORDERS_COLLECTION = 'orders';

interface GetOrdersOptions {
    limit?: number;
    lastVisible?: QueryDocumentSnapshot<DocumentData>;
}

/**
 * Sanitize Firestore data by converting Timestamps to ISO strings
 */
function sanitizeFirestoreData(data: any): any {
    const sanitizedData: any = {};

    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            sanitizedData[key] = value.toDate().toISOString();
        } else if (typeof value === 'object' && value !== null) {
            sanitizedData[key] = sanitizeFirestoreData(value);
        } else {
            sanitizedData[key] = value;
        }
    }

    return sanitizedData;
}

/**
 * Get orders for a specific user
 */
export async function getUserOrders(
    userId: string,
    options: GetOrdersOptions = {}
) {
    try {
        const limitCount = options.limit || 10;
        let ordersQuery = query(
            collection(firestore, ORDERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        // If we have a last visible document, paginate from there
        if (options.lastVisible) {
            ordersQuery = query(
                collection(firestore, ORDERS_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                startAfter(options.lastVisible),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(ordersQuery);
        const orders: Order[] = [];

        snapshot.forEach((doc) => {
            // Sanitize each order document
            orders.push(
                sanitizeFirestoreData({ id: doc.id, ...doc.data() }) as Order
            );
        });

        // Get the last visible document for pagination
        const lastVisible =
            snapshot.docs.length > 0
                ? snapshot.docs[snapshot.docs.length - 1]
                : null;

        return {
            orders,
            lastVisible,
            hasMore: orders.length === limitCount,
        };
    } catch (error) {
        console.error('Error getting user orders:', error);
        throw error;
    }
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
        const orderDoc = await getDoc(orderRef);

        if (!orderDoc.exists()) {
            return null;
        }

        // Sanitize the data to convert Timestamps to ISO strings
        return sanitizeFirestoreData({
            id: orderDoc.id,
            ...orderDoc.data(),
        }) as Order;
    } catch (error) {
        console.error('Error getting order by ID:', error);
        throw error;
    }
}

/**
 * Create a new order
 */
export async function createOrder(
    orderData: Omit<Order, 'id'>
): Promise<string> {
    try {
        // Clean the order data to remove any undefined values
        const cleanOrderData = JSON.parse(JSON.stringify(orderData));
        
        // Ensure createdAt is a Firebase Timestamp
        const finalOrderData = {
            ...cleanOrderData,
            createdAt: serverTimestamp(),
        };

        const orderRef = await addDoc(
            collection(firestore, ORDERS_COLLECTION),
            finalOrderData
        );
        return orderRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    id: string,
    status: Order['status']
): Promise<void> {
    try {
        const orderRef = doc(firestore, ORDERS_COLLECTION, id);
        await updateDoc(orderRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Get recent orders for admin dashboard
 */
export async function getRecentOrders(limitCount = 5) {
    try {
        const ordersQuery = query(
            collection(firestore, ORDERS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(ordersQuery);
        const orders: Order[] = [];

        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        return orders;
    } catch (error) {
        console.error('Error getting recent orders:', error);
        throw error;
    }
}

/**
 * Get order statistics for admin dashboard
 */
export async function getOrderStats() {
    try {
        // This is a simplified version. In a real app, you might use
        // cloud functions or server endpoints for more complex calculations.

        const allOrdersQuery = await getDocs(
            collection(firestore, ORDERS_COLLECTION)
        );

        // Total order count
        const totalOrders = allOrdersQuery.size;

        // Orders by status
        const statusCounts: Record<string, number> = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        // Total revenue
        let totalRevenue = 0;

        // Recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let recentOrdersCount = 0;

        allOrdersQuery.forEach((doc) => {
            const order = doc.data() as Order;

            // Count orders by status
            if (order.status && statusCounts[order.status] !== undefined) {
                statusCounts[order.status]++;
            }

            // Sum total revenue
            if (order.total) {
                totalRevenue += order.total;
            }

            // Count recent orders
            const orderDate =
                order.createdAt instanceof Timestamp
                    ? order.createdAt.toDate()
                    : new Date(order.createdAt);

            if (orderDate >= thirtyDaysAgo) {
                recentOrdersCount++;
            }
        });

        return {
            totalOrders,
            statusCounts,
            totalRevenue,
            recentOrdersCount,
        };
    } catch (error) {
        console.error('Error getting order stats:', error);
        throw error;
    }
}

export async function getAllOrders(
    options: {
        status?: Order['status'];
        limit?: number;
        lastVisible?: QueryDocumentSnapshot<DocumentData>;
    } = {}
) {
    try {
        const colRef = collection(firestore, ORDERS_COLLECTION);
        const constraints: QueryConstraint[] = [];

        if (options.status) {
            constraints.push(where('status', '==', options.status));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (options.limit) {
            constraints.push(limit(options.limit));
        }

        if (options.lastVisible) {
            constraints.push(startAfter(options.lastVisible));
        }

        const q = query(colRef, ...constraints);

        const querySnapshot = await getDocs(q);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            // Sanitize each order document
            orders.push(sanitizeFirestoreData({
                id: doc.id,
                ...doc.data(),
            }) as Order);
        });

        return { orders, lastVisible };
    } catch (error) {
        console.error('Error getting all orders:', error);
        throw error;
    }
}
