export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type Theme = {
  name: string;
  label: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts: {
    heading: string;
    body: string;
  };
  buttonStyle: 'rounded' | 'square' | 'pill';
  cardStyle: 'flat' | 'raised' | 'bordered';
  borderRadius: {
    button: string;
    card: string;
    input: string;
  };
  spacing: {
    container: string;
    section: string;
    element: string;
  };
  description: string;
  preview: string; // Image URL for preview
};

// Define available themes (Shopify-inspired)
export const storeThemes: Record<string, Theme> = {
  default: {
    name: 'default',
    label: 'Default',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '240 5.9% 10%',
        primaryForeground: '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        secondaryForeground: '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        accentForeground: '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '240 5.9% 10%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '0 0% 98%',
        primaryForeground: '240 5.9% 10%',
        secondary: '240 3.7% 15.9%',
        secondaryForeground: '0 0% 98%',
        muted: '240 3.7% 15.9%',
        mutedForeground: '240 5% 64.9%',
        accent: '240 3.7% 15.9%',
        accentForeground: '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '240 4.9% 83.9%',
      }
    },
    fonts: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
    },
    buttonStyle: 'rounded',
    cardStyle: 'flat',
    borderRadius: {
      button: '0.5rem',
      card: '0.5rem',
      input: '0.5rem',
    },
    spacing: {
      container: '2rem',
      section: '4rem 0',
      element: '1rem',
    },
    description: 'Clean and minimal default theme',
    preview: '/images/themes/default.jpg',
  },
  debut: {
    name: 'debut',
    label: 'Debut',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '220 90% 45%', // Shopify blue
        primaryForeground: '0 0% 100%',
        secondary: '220 5% 96%',
        secondaryForeground: '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '220 90% 45%',
        accentForeground: '0 0% 100%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '220 13% 91%',
        input: '220 13% 91%',
        ring: '220 90% 45%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '220 90% 55%', // Brighter Shopify blue for dark mode
        primaryForeground: '0 0% 98%',
        secondary: '240 3.7% 15.9%',
        secondaryForeground: '0 0% 98%',
        muted: '240 3.7% 15.9%',
        mutedForeground: '240 5% 64.9%',
        accent: '220 90% 55%',
        accentForeground: '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '220 90% 55%',
      }
    },
    fonts: {
      heading: "'Poppins', sans-serif",
      body: "'Roboto', sans-serif",
    },
    buttonStyle: 'rounded',
    cardStyle: 'raised',
    borderRadius: {
      button: '0.375rem',
      card: '0.375rem',
      input: '0.375rem',
    },
    spacing: {
      container: '2rem',
      section: '5rem 0',
      element: '1rem',
    },
    description: 'Classic and versatile, inspired by Shopify Debut',
    preview: '/images/themes/debut.jpg',
  },
  brooklyn: {
    name: 'brooklyn',
    label: 'Brooklyn',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '172 65% 42%', // Mint/teal
        primaryForeground: '0 0% 100%',
        secondary: '171 12% 96%',
        secondaryForeground: '240 5.9% 10%',
        muted: '171 12% 96%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '172 45% 52%',
        accentForeground: '0 0% 100%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '171 18% 86%',
        input: '171 18% 86%',
        ring: '172 65% 42%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '172 65% 50%',
        primaryForeground: '0 0% 98%',
        secondary: '172 10% 18%',
        secondaryForeground: '0 0% 98%',
        muted: '172 10% 18%',
        mutedForeground: '240 5% 64.9%',
        accent: '172 65% 50%',
        accentForeground: '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '172 10% 25%',
        input: '172 10% 25%',
        ring: '172 65% 50%',
      }
    },
    fonts: {
      heading: "'Montserrat', sans-serif",
      body: "'Open Sans', sans-serif",
    },
    buttonStyle: 'pill',
    cardStyle: 'flat',
    borderRadius: {
      button: '9999px',
      card: '0.75rem',
      input: '0.5rem',
    },
    spacing: {
      container: '3rem',
      section: '6rem 0',
      element: '1.25rem',
    },
    description: 'Modern and fresh with a teal accent',
    preview: '/images/themes/brooklyn.jpg',
  },
  venture: {
    name: 'venture',
    label: 'Venture',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '350 80% 56%', // Shopify red
        primaryForeground: '0 0% 100%',
        secondary: '349 12% 96%',
        secondaryForeground: '240 5.9% 10%',
        muted: '349 12% 96%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '350 80% 56%',
        accentForeground: '0 0% 100%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '349 18% 88%',
        input: '349 18% 88%',
        ring: '350 80% 56%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '350 80% 65%',
        primaryForeground: '0 0% 98%',
        secondary: '350 10% 20%',
        secondaryForeground: '0 0% 98%',
        muted: '350 10% 20%',
        mutedForeground: '240 5% 64.9%',
        accent: '350 80% 65%',
        accentForeground: '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '350 10% 25%',
        input: '350 10% 25%',
        ring: '350 80% 65%',
      }
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto Condensed', sans-serif",
    },
    buttonStyle: 'square',
    cardStyle: 'bordered',
    borderRadius: {
      button: '0.125rem',
      card: '0.125rem',
      input: '0.125rem',
    },
    spacing: {
      container: '1.5rem',
      section: '5rem 0',
      element: '1rem',
    },
    description: 'Bold and adventurous with a vibrant red',
    preview: '/images/themes/venture.jpg',
  },
  supply: {
    name: 'supply',
    label: 'Supply',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '50 93% 52%', // Amber/gold
        primaryForeground: '240 10% 3.9%',
        secondary: '50 20% 96%',
        secondaryForeground: '240 10% 3.9%',
        muted: '50 20% 96%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '50 93% 45%',
        accentForeground: '240 10% 3.9%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '50 10% 85%',
        input: '50 10% 85%',
        ring: '50 93% 52%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '50 93% 60%',
        primaryForeground: '240 10% 3.9%',
        secondary: '50 15% 20%',
        secondaryForeground: '0 0% 98%',
        muted: '50 15% 20%',
        mutedForeground: '240 5% 64.9%',
        accent: '50 93% 60%',
        accentForeground: '240 10% 3.9%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '50 15% 25%',
        input: '50 15% 25%',
        ring: '50 93% 60%',
      }
    },
    fonts: {
      heading: "'Archivo Black', sans-serif",
      body: "'Work Sans', sans-serif",
    },
    buttonStyle: 'square',
    cardStyle: 'flat',
    borderRadius: {
      button: '0',
      card: '0',
      input: '0',
    },
    spacing: {
      container: '1rem',
      section: '4rem 0',
      element: '0.75rem',
    },
    description: 'Industrial and warm with amber accents',
    preview: '/images/themes/supply.jpg',
  },
  narrative: {
    name: 'narrative',
    label: 'Narrative',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        cardForeground: '240 10% 3.9%',
        popover: '0 0% 100%',
        popoverForeground: '240 10% 3.9%',
        primary: '265 83% 45%', // Rich purple
        primaryForeground: '0 0% 100%',
        secondary: '265 20% 96%',
        secondaryForeground: '240 5.9% 10%',
        muted: '265 20% 96%',
        mutedForeground: '240 3.8% 46.1%',
        accent: '265 83% 45%',
        accentForeground: '0 0% 100%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '265 16% 88%',
        input: '265 16% 88%',
        ring: '265 83% 45%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 3.9%',
        popoverForeground: '0 0% 98%',
        primary: '265 83% 60%',
        primaryForeground: '0 0% 98%',
        secondary: '265 20% 15%',
        secondaryForeground: '0 0% 98%',
        muted: '265 20% 15%',
        mutedForeground: '240 5% 64.9%',
        accent: '265 83% 60%',
        accentForeground: '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 98%',
        border: '265 20% 25%',
        input: '265 20% 25%',
        ring: '265 83% 60%',
      }
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lora', serif",
    },
    buttonStyle: 'pill',
    cardStyle: 'flat',
    borderRadius: {
      button: '9999px',
      card: '1rem',
      input: '0.5rem',
    },
    spacing: {
      container: '2.5rem',
      section: '7rem 0', 
      element: '1.5rem',
    },
    description: 'Elegant storytelling with purple tones',
    preview: '/images/themes/narrative.jpg',
  },
};

// Helper function to get CSS variables
export function getThemeVariables(themeName: string, mode: 'light' | 'dark' = 'light') {
  const theme = storeThemes[themeName] || storeThemes.default;
  const colors = theme.colors[mode];
  
  return {
    // Colors
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    
    // Fonts
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
    
    // Border radius
    '--radius': theme.borderRadius.card,
    '--radius-button': theme.borderRadius.button,
    '--radius-input': theme.borderRadius.input,
    
    // Spacing
    '--container-padding': theme.spacing.container,
    '--section-spacing': theme.spacing.section,
    '--element-spacing': theme.spacing.element,
    
    // Theme specific
    '--theme-card-style': theme.cardStyle,
    '--theme-button-style': theme.buttonStyle,
  };
}

// Function to detect and apply current mode
export function applyThemeMode(themeName: string, mode: 'light' | 'dark' | 'system' = 'system') {
  // If system, detect user preference
  if (mode === 'system') {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mode = isDarkMode ? 'dark' : 'light';
  }
  
  // Get theme variables
  const themeVars = getThemeVariables(themeName, mode);
  const root = document.documentElement;
  
  // Apply the variables
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Add class for light/dark mode
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  return mode;
}

// Function to preload all theme assets for performance
export function preloadThemeAssets() {
  // Preload common theme images or fonts that might be used
  Object.values(storeThemes).forEach(theme => {
    if (theme.preview) {
      const img = new Image();
      img.src = theme.preview;
    }
  });
}
