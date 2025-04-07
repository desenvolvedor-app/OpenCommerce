import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import { CartWrapper } from '@/components/cart/cart-wrapper';
import { ThemeStyle } from '@/components/theme/theme-style';
import { ThemeFonts } from '@/components/theme/theme-fonts';
import { ThemeLoader } from '@/components/theme/theme-loader';
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
            <head>
                {/* Preload the default font to avoid FOUT */}
                <link
                    rel="preload"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
                    as="style"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
                />
                
                {/* Add preconnect for Google Fonts to improve performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body
                className={cn(
                    'min-h-screen font-sans antialiased transition-colors',
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
                            <ThemeLoader>
                                <ThemeFonts />
                                <ThemeStyle />
                                {children}
                                <Toaster position="top-right" richColors />
                            </ThemeLoader>
                        </CartWrapper>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
