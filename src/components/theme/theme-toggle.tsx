'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getThemeSettings } from '@/services/settings-service';

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [allowToggle, setAllowToggle] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Check if admin allows theme toggling
    async function checkThemeSettings() {
      try {
        const settings = await getThemeSettings();
        setAllowToggle(settings.allowUserThemeToggle);
      } catch (error) {
        console.error('Failed to check theme toggle permissions:', error);
      }
    }
    
    checkThemeSettings();
  }, []);
  
  // Wait until mounted to avoid hydration mismatch
  if (!mounted || !allowToggle) return null;
  
  // Function to toggle between light and dark
  const toggleTheme = () => {
    // Add no-transition class briefly when changing themes to prevent flashing
    document.documentElement.classList.add('no-transition');
    
    // Toggle between light and dark
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    
    // Remove the no-transition class after a small delay
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative h-9 w-9 rounded-md"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
