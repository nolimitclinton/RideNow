import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME } from '../constants/themes';
import { Theme, ThemeMode } from '../types/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_PREFERENCE_KEY = 'theme.preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  

  const [themeMode, setThemeModeState] = useState<ThemeMode>(systemColorScheme === 'dark' ? 'dark' : 'light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme preference from storage, use system default as initial
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          // Use saved theme preference
          setThemeModeState(savedTheme);
        } else if (systemColorScheme === 'dark' || systemColorScheme === 'light') {
          // No saved preference, use system color scheme
          setThemeModeState(systemColorScheme);
        } else {
          // Fallback to light if system scheme is null
          setThemeModeState('light');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        // Fallback to system or light if error
        if (systemColorScheme === 'dark' || systemColorScheme === 'light') {
          setThemeModeState(systemColorScheme);
        }
      } finally {
        setIsHydrated(true);
      }
    })();
  }, [systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const theme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
