export const lightTheme = {
  colors: {
    background: '#ffffff',
    foreground: '#020617',
    card: '#ffffff',
    cardForeground: '#020617',
    popover: '#ffffff',
    popoverForeground: '#020617',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#a1a1aa',
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
} as const;

export const darkTheme = {
  colors: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#09090b',
    cardForeground: '#fafafa',
    popover: '#09090b',
    popoverForeground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#18181b',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    accent: '#27272a',
    accentForeground: '#fafafa',
    destructive: '#f87171',
    destructiveForeground: '#18181b',
    border: '#27272a',
    input: '#27272a',
    ring: '#52525b',
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
} as const;

export const reusablesTheme = lightTheme;
