import { doc, getDoc } from 'firebase/firestore';

import { firestore } from '@/lib/firebase/firebase';

export interface StoreSettings {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    taxEnabled: boolean;
    taxRate: number;
}

export interface ShippingSettings {
    zones: {
        domestic: {
            enabled: boolean;
            name: string;
            countries: string[];
        };
        international: {
            enabled: boolean;
            name: string;
            countries: string[];
        };
    };
    method: 'flat-rate' | 'free' | 'calculated';
    flatRate: number;
    domesticFlatRate?: number;
    internationalFlatRate?: number;
    freeShippingThreshold?: number;
    internationalMultiplier?: number;
    weightRanges: {
        minWeight: number;
        maxWeight: number;
        price: number;
    }[];
}

export interface PaymentSettings {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    stripeKey: string;
    paypalClientId: string;
}

// Get store settings (tax, currency, etc.)
export async function getStoreSettings(): Promise<StoreSettings> {
    try {
        const docRef = doc(firestore, 'settings', 'store');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as StoreSettings;
        }

        // Return default settings if none exist
        return {
            name: 'OpenCommerce',
            email: 'contact@example.com',
            phone: '(555) 123-4567',
            address: '123 Main St, Anytown, ST 12345',
            currency: 'USD',
            taxEnabled: true,
            taxRate: 10, // Default 10% tax rate
        };
    } catch (error) {
        console.error('Error getting store settings:', error);
        throw error;
    }
}

// Get shipping settings
export async function getShippingSettings(): Promise<ShippingSettings> {
    try {
        const docRef = doc(firestore, 'settings', 'shipping');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ShippingSettings;
        }

        // Return default shipping settings if none exist
        return {
            zones: {
                domestic: {
                    enabled: true,
                    name: 'Domestic Shipping',
                    countries: ['us', 'United States'],
                },
                international: {
                    enabled: true,
                    name: 'International Shipping',
                    countries: ['Worldwide'],
                },
            },
            method: 'flat-rate',
            flatRate: 10,
            domesticFlatRate: 5,
            internationalFlatRate: 15,
            freeShippingThreshold: 100,
            weightRanges: [{ minWeight: 0, maxWeight: 5, price: 5.99 }],
        };
    } catch (error) {
        console.error('Error getting shipping settings:', error);
        throw error;
    }
}

// Get payment settings
export async function getPaymentSettings(): Promise<PaymentSettings> {
    try {
        const docRef = doc(firestore, 'settings', 'payment');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as PaymentSettings;
        }

        // Return default payment settings if none exist
        return {
            stripeEnabled: true,
            paypalEnabled: false,
            stripeKey: '',
            paypalClientId: '',
        };
    } catch (error) {
        console.error('Error getting payment settings:', error);
        throw error;
    }
}

// Calculate shipping cost based on settings and order details
export async function calculateShipping(
    countryCode: string,
    weight?: number,
    subtotal?: number
): Promise<number> {
    try {
        const shippingSettings = await getShippingSettings();

        // Check if shipping is free for orders above a certain amount
        if (
            subtotal &&
            shippingSettings.freeShippingThreshold &&
            subtotal >= shippingSettings.freeShippingThreshold
        ) {
            return 0;
        }

        // Check if shipping is enabled for the country
        const isDomestic =
            shippingSettings.zones.domestic.countries.includes(countryCode);
        const isInternational =
            shippingSettings.zones.international.countries.includes(
                countryCode
            ) ||
            shippingSettings.zones.international.countries.includes(
                'Worldwide'
            );

        // Use default shipping options if the country isn't specifically in a zone
        if (!isDomestic && !isInternational) {
            return shippingSettings.flatRate;
        }

        // For domestic shipping that is disabled, fall back to international
        if (isDomestic && !shippingSettings.zones.domestic.enabled) {
            if (
                isInternational &&
                shippingSettings.zones.international.enabled
            ) {
            } else {
                return shippingSettings.flatRate; // Default to flat rate instead of throwing
            }
        }

        // Calculate based on shipping method
        if (shippingSettings.method === 'free') {
            return 0;
        }

        if (shippingSettings.method === 'flat-rate') {
            // Apply different rates for domestic vs international if configured
            if (isDomestic && shippingSettings.domesticFlatRate !== undefined) {
                return shippingSettings.domesticFlatRate;
            } else if (
                isInternational &&
                shippingSettings.internationalFlatRate !== undefined
            ) {
                return shippingSettings.internationalFlatRate;
            }
            return shippingSettings.flatRate;
        }

        if (shippingSettings.method === 'calculated' && weight) {
            // Find the appropriate weight range
            const range = shippingSettings.weightRanges.find(
                (range) =>
                    weight >= range.minWeight && weight <= range.maxWeight
            );

            if (range) {
                // Apply domestic/international multiplier if applicable
                const basePrice = range.price;
                if (
                    isInternational &&
                    shippingSettings.internationalMultiplier
                ) {
                    return basePrice * shippingSettings.internationalMultiplier;
                }
                return basePrice;
            }

            // If weight exceeds all ranges, use the highest
            const highestRange = shippingSettings.weightRanges.reduce(
                (prev, current) =>
                    current.maxWeight > prev.maxWeight ? current : prev,
                shippingSettings.weightRanges[0]
            );

            const basePrice = highestRange.price;
            if (isInternational && shippingSettings.internationalMultiplier) {
                return basePrice * shippingSettings.internationalMultiplier;
            }
            return basePrice;
        }

        // Default to flat rate if no valid calculation can be made
        return shippingSettings.flatRate;
    } catch (error) {
        console.error('Error calculating shipping:', error);
        // Return a default value instead of throwing
        return 10; // Default $10 shipping
    }
}

// Calculate tax based on settings
export async function calculateTax(subtotal: number): Promise<number> {
    try {
        const storeSettings = await getStoreSettings();

        if (!storeSettings.taxEnabled) {
            return 0;
        }

        return (subtotal * storeSettings.taxRate) / 100;
    } catch (error) {
        console.error('Error calculating tax:', error);
        // Return a default value instead of throwing
        return 0;
    }
}
