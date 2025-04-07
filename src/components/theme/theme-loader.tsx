'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { getThemeVariables, storeThemes } from '@/lib/themes';
import { getThemeSettings } from '@/services/settings-service';

interface ThemeLoaderProps {
  children: React.ReactNode;
  onThemeLoaded?: () => void;
}

export function ThemeLoader({ children, onThemeLoaded }: ThemeLoaderProps) {
  const [loading, setLoading] = useState(true);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Use a class on html element to prevent transitions during loading
    document.documentElement.classList.add('no-transition');
    document.body.classList.add('theme-loading');
    
    async function loadTheme() {
      try {
        // Fetch theme settings
        const settings = await getThemeSettings();
        const themeName = settings.primaryColor || 'default';
        
        // Handle theme mode preferences based on admin settings
        if (settings.allowUserThemeToggle) {
          // If user toggling is allowed, use system preference initially
          // but the ThemeProvider will handle user preferences later
          const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setTheme('system'); // Start with system, will be overridden if user has a saved preference
        } else {
          // If user toggling is not allowed, force light mode
          setTheme('light');
        }
        
        // Get the current color scheme for initial load
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = isDarkMode ? 'dark' : 'light';
        
        // Apply the theme with the current mode
        applyTheme(themeName, initialMode);
        
        // Set up theme change listener for dark/light mode
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleColorSchemeChange = (e: MediaQueryListEvent) => {
          if (!settings.allowUserThemeToggle) return; // Skip if user toggling is disabled
          if (document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark')) {
            // Skip if user has explicitly selected a theme (not using system)
            return;
          }
          
          // Apply theme with the new mode
          applyTheme(themeName, e.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handleColorSchemeChange);
        
        // Clean up function
        return () => {
          mediaQuery.removeEventListener('change', handleColorSchemeChange);
        };
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        // Mark as loaded and enable transitions
        setLoading(false);
        if (onThemeLoaded) onThemeLoaded();
        
        // Remove the loading classes after a small delay
        setTimeout(() => {
          document.documentElement.classList.remove('no-transition');
          document.body.classList.remove('theme-loading');
          document.body.classList.add('theme-ready');
        }, 100);
      }
    }
    
    loadTheme();
  }, [setTheme, onThemeLoaded]);
  
  // Function to apply theme with a specific mode
  const applyTheme = (themeName: string, mode: 'light' | 'dark') => {
    // Apply the theme
    const theme = storeThemes[themeName] || storeThemes.default;
    const themeVars = getThemeVariables(themeName, mode);
    
    // Apply variables to :root
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    
    // Apply theme attributes
    document.documentElement.setAttribute('data-store-theme', theme.name);
    document.documentElement.setAttribute('data-theme-card-style', theme.cardStyle);
    document.documentElement.setAttribute('data-theme-button-style', theme.buttonStyle);
    
    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim() + ` theme-${theme.name}`;
    
    // Preload theme assets (optional)
    if (theme.preview) {
      const img = new Image();
      img.src = theme.preview;
    }
    
    // Preload fonts
    if (theme.fonts) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      
      // Format Google Fonts URL for the theme's fonts
      const headingFont = theme.fonts.heading.split(',')[0].trim().replace(/'/g, '');
      const bodyFont = theme.fonts.body.split(',')[0].trim().replace(/'/g, '');
      
      // Skip default fonts
      if (headingFont !== 'Inter' || bodyFont !== 'Inter') {
        const fonts = new Set([headingFont, bodyFont]);
        const fontQuery = Array.from(fonts)
          .filter(font => font !== 'Inter')
          .map(font => `family=${encodeURIComponent(font)}:wght@300;400;500;700`)
          .join('&');
        
        if (fontQuery) {
          link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
          document.head.appendChild(link);
        }
      }
    }
  };

  // Effect to update theme when resolvedTheme changes
  useEffect(() => {
    if (!loading && resolvedTheme) {
      // Apply new theme mode when it changes
      const themeName = document.documentElement.getAttribute('data-store-theme') || 'default';
      applyTheme(themeName, resolvedTheme as 'light' | 'dark');
    }
  }, [loading, resolvedTheme]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-foreground/80">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
