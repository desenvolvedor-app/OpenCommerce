'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { getThemeSettings } from '@/services/settings-service';
import { storeThemes } from '@/lib/themes';

export function ThemeStyle() {
  const [css, setCss] = useState<string>('');
  const { resolvedTheme } = useTheme();
  const [themeName, setThemeName] = useState<string>('default');

  useEffect(() => {
    const loadThemeStyle = async () => {
      try {
        const settings = await getThemeSettings();
        const selectedThemeName = settings.primaryColor || 'default';
        setThemeName(selectedThemeName);
        
        // Get the current mode (dark or light)
        const isDark = resolvedTheme === 'dark';
        
        // Generate theme-specific CSS based on current mode
        const selectedTheme = storeThemes[selectedThemeName] || storeThemes.default;
        
        const cssRules = `
          /* Common theme styles */
          body {
            font-family: ${selectedTheme.fonts.body};
            letter-spacing: ${selectedThemeName === 'venture' ? '0.01em' : 'normal'};
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: ${selectedTheme.fonts.heading};
            ${selectedThemeName === 'narrative' ? 'font-weight: 400;' : ''}
          }
          
          /* Dark mode specific styles */
          .dark .card {
            ${selectedTheme.cardStyle === 'raised' ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);' : ''}
          }
          
          .dark .product-card {
            ${selectedTheme.cardStyle === 'raised' ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);' : ''}
          }
          
          /* Light mode specific styles */
          .light .card {
            ${selectedTheme.cardStyle === 'raised' ? 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);' : ''}
          }
          
          .light .product-card {
            ${selectedTheme.cardStyle === 'raised' ? 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);' : ''}
          }
          
          /* Theme-specific buttons */
          .primary-button, button:not(.unstyled) {
            border-radius: ${selectedTheme.borderRadius.button};
            ${selectedThemeName === 'venture' ? 'text-transform: uppercase; letter-spacing: 0.05em;' : ''}
            ${selectedThemeName === 'supply' ? 'text-transform: uppercase; letter-spacing: 0.03em;' : ''}
          }
          
          /* Additional theme-specific customizations */
          ${selectedThemeName === 'brooklyn' ? `
            .product-card:hover img {
              transform: scale(1.05);
            }
            .product-card img {
              transition: transform 0.3s ease;
            }
          ` : ''}
          
          ${selectedThemeName === 'venture' ? `
            .product-card:hover {
              border-color: hsl(var(--primary));
            }
          ` : ''}
          
          ${selectedThemeName === 'narrative' ? `
            .product-title, .card-title {
              font-family: ${selectedTheme.fonts.heading};
            }
          ` : ''}
          
          /* Ensure proper dark mode transitions */
          .dark body, .light body {
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
          }
        `;
        
        setCss(cssRules);
      } catch (error) {
        console.error('Failed to load theme styles:', error);
      }
    };
    
    loadThemeStyle();
  }, [resolvedTheme]);

  return css ? <style jsx global>{css}</style> : null;
}
