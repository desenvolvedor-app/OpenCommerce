'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeSettings } from '@/services/settings-service';
import { storeThemes } from '@/lib/themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThemeDebugger() {
  const { theme, setTheme } = useTheme();
  const [storeTheme, setStoreTheme] = useState('');
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadThemeInfo = async () => {
      try {
        const settings = await getThemeSettings();
        setStoreTheme(settings.primaryColor);
        
        // Get current CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const variables: Record<string, string> = {};
        
        [
          '--background', '--foreground', '--primary', '--primary-foreground',
          '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
          '--muted', '--muted-foreground', '--border', '--radius'
        ].forEach(variable => {
          variables[variable] = computedStyle.getPropertyValue(variable);
        });
        
        setCssVars(variables);
      } catch (error) {
        console.error('Failed to load theme debug info:', error);
      }
    };
    
    loadThemeInfo();
  }, [theme]);
  
  const applyTestTheme = (themeName: string) => {
    // This is for testing only - manually applies a theme
    const themeObj = storeThemes[themeName];
    if (!themeObj) return;
    
    document.documentElement.setAttribute('data-store-theme', themeName);
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim() + ` theme-${themeName}`;
    
    // Force reload the page
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Debugger</CardTitle>
        <CardDescription>Current theme configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Selected Theme:</div>
          <div>{storeTheme}</div>
          
          <div className="font-medium">Current Mode:</div>
          <div>{theme}</div>
          
          <div className="font-medium">Data Attribute:</div>
          <div>{document.documentElement.getAttribute('data-store-theme')}</div>
          
          <div className="font-medium">Body Classes:</div>
          <div>{document.body.className}</div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">CSS Variables:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(cssVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Themes:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(storeThemes).map(themeName => (
              <Button 
                key={themeName}
                size="sm"
                variant={storeTheme === themeName ? "default" : "outline"}
                onClick={() => applyTestTheme(themeName)}
              >
                {themeName}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
