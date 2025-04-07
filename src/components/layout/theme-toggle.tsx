'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getThemeSettings } from '@/services/settings-service';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [allowToggle, setAllowToggle] = useState(true);

    useEffect(() => {
        setMounted(true);
        
        // Check if admin allows theme toggling
        async function checkThemeSettings() {
            try {
                const settings = await getThemeSettings();
                setAllowToggle(settings.allowUserThemeToggle);
            } catch (error) {
                console.error('Failed to load theme settings:', error);
            }
        }
        
        checkThemeSettings();
    }, []);

    // Only show toggle if admin allows it
    if (!mounted || !allowToggle) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
