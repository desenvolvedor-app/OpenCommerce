export const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'ES', name: 'Spain' },
    { code: 'MX', name: 'Mexico' },
    { code: 'KR', name: 'South Korea' },
    { code: 'RU', name: 'Russia' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SG', name: 'Singapore' },
    { code: 'NZ', name: 'New Zealand' },
];

export const PAYMENT_CARD_TYPES = [
    { id: 'visa', name: 'Visa' },
    { id: 'mastercard', name: 'Mastercard' },
    { id: 'amex', name: 'American Express' },
    { id: 'discover', name: 'Discover' },
];

export const MONTHS = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
];

// Generate years from current year to current year + 10
const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
});

// Order statuses with colors for UI
export const ORDER_STATUSES = [
    {
        value: 'pending',
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
        value: 'processing',
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
        value: 'shipped',
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
        value: 'delivered',
        label: 'Delivered',
        color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
        value: 'cancelled',
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
    },
];
