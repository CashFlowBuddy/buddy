export const lightTheme = {
  colors: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    popover: '#ffffff',
    popoverForeground: '#0a0a0a',
    primary: '#00a852',
    primaryForeground: '#d0f7e0',
    secondary: '#f3f3f5',
    secondaryForeground: '#191b1f',
    muted: '#f3f3f5',
    mutedForeground: '#737373',
    accent: '#f3f3f5',
    accentForeground: '#191b1f',
    destructive: '#ff3333',
    destructiveForeground: '#fafafa',
    border: '#e6e6e6',
    input: '#e6e6e6',
    ring: '#a1a1a1',
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
} as const;

export const darkTheme = {
  colors: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#0a0a0a',
    cardForeground: '#fafafa',
    popover: '#0a0a0a',
    popoverForeground: '#fafafa',
    primary: '#1aaa70',
    primaryForeground: '#001a11',
    secondary: '#282a30',
    secondaryForeground: '#fafafa',
    muted: '#282a30',
    mutedForeground: '#a1a1a1',
    accent: '#282a30',
    accentForeground: '#fafafa',
    destructive: '#ff3333',
    destructiveForeground: '#0a0a0a',
    border: '#282a30',
    input: '#282a30',
    ring: '#737373',
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
} as const;

export const reusablesTheme = lightTheme;
