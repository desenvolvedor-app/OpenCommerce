'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getThemeSettings } from '@/services/settings-service';
import { storeThemes } from '@/lib/themes';

export function ThemeFonts() {
  const [themeName, setThemeName] = useState<string>('default');
  const { theme } = useTheme();
  
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const settings = await getThemeSettings();
        setThemeName(settings.primaryColor || 'default');
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    };
    
    loadThemeSettings();
  }, [theme]);
  
  // Get theme-specific fonts
  const currentTheme = storeThemes[themeName] || storeThemes.default;
  
  return (
    <style jsx global>{`
      :root {
        --font-heading: ${currentTheme.fonts.heading};
        --font-body: ${currentTheme.fonts.body};
      }
    `}</style>
  );
}
