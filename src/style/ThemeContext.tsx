import React, { createContext, useContext } from 'react';

export type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
