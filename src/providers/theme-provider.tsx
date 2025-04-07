'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect, useState } from 'react';

import { getThemeSettings, ThemeSettings } from '@/services/settings-service';

interface CustomThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
    const [mounted, setMounted] = useState(false);
    
    // Load theme settings on client-side
    useEffect(() => {
        async function loadThemeSettings() {
            try {
                const settings = await getThemeSettings();
                setThemeSettings(settings);
                setMounted(true);
            } catch (error) {
                console.error('Failed to load theme settings:', error);
                setMounted(true);
            }
        }

        loadThemeSettings();
    }, []);

    // Apply theme settings from admin config
    return (
        <NextThemesProvider
            {...props}
            themes={['light', 'dark']}
            defaultTheme={mounted && themeSettings?.allowUserThemeToggle ? 'system' : 'light'}
            enableSystem={themeSettings?.allowUserThemeToggle ?? true}
            enableColorScheme
            attribute="class"
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
