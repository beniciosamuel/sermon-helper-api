import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../styles/theme';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Initialize theme synchronously before React renders to prevent flash
const initializeTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      // Apply theme class immediately
      document.body.classList.add(`theme-${saved}`);
      document.documentElement.classList.add(`theme-${saved}`);
      return saved;
    }
  }
  // Default to dark
  document.body.classList.add('theme-dark');
  document.documentElement.classList.add('theme-dark');
  return 'dark';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(initializeTheme);

  // Apply theme class to body when theme changes
  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;

    // Remove both classes first
    body.classList.remove('theme-dark', 'theme-light');
    root.classList.remove('theme-dark', 'theme-light');

    // Add the current theme class
    body.classList.add(`theme-${theme}`);
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

