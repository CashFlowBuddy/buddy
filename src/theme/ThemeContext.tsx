import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { lightTheme, darkTheme } from './reuseable-theme';

export type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof lightTheme.colors | typeof darkTheme.colors;
  radius: typeof lightTheme.radius | typeof darkTheme.radius;
};

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  toggleTheme: () => {},
  colors: lightTheme.colors,
  radius: lightTheme.radius,
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: colorScheme as 'light' | 'dark',
        toggleTheme,
        colors: currentTheme.colors,
        radius: currentTheme.radius,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
