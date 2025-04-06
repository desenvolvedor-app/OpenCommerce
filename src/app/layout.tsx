import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import { CartWrapper } from '@/components/cart/cart-wrapper';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'OpenCommerce',
    description: 'A modern e-commerce platform built with Next.js and Firebase',
    keywords: ['e-commerce', 'online store', 'shop', 'nextjs', 'firebase'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen font-sans antialiased',
                    fontSans.variable
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <AuthProvider>
                        <CartWrapper>
                            {children}
                            <Toaster position="top-right" richColors />
                        </CartWrapper>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
