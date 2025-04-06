import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

export function formatDate(date: Date | string | number | { toDate: () => Date } | null | undefined): string {
    if (!date) return 'N/A';

    let jsDate: Date;

    try {
        // Handle Firebase Timestamp objects that have toDate() method
        if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
            jsDate = date.toDate();
        }
        // Handle string/number timestamps
        else if (typeof date === 'string' || typeof date === 'number') {
            jsDate = new Date(date);
        }
        // Handle Date objects
        else if (date instanceof Date) {
            jsDate = date;
        }
        // Default fallback
        else {
            return 'Invalid date';
        }

        // Validate the date is valid before formatting
        if (isNaN(jsDate.getTime())) {
            return 'Invalid date';
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(jsDate);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove consecutive hyphens
        .trim();
}

export function isAdmin(user: { role?: string } | null): boolean {
    return user?.role === 'admin';
}

export function getInitials(name?: string): string {
    if (!name) return '?';

    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
}
