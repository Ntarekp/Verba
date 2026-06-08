import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ThemeColors, 
  classicThemeColors, 
  royalThemeColors, 
  midnightThemeColors 
} from '../styles/theme';

export type ThemeType = 'Classic' | 'Royal' | 'Midnight';
export type FontScaleType = 'Small' | 'Medium' | 'Large';

interface ThemeContextProps {
  themeName: ThemeType;
  isDarkMode: boolean;
  fontScale: FontScaleType;
  themeColors: ThemeColors;
  setThemeName: (theme: ThemeType) => void;
  setIsDarkMode: (isDark: boolean) => void;
  setFontScale: (scale: FontScaleType) => void;
  fontSizeMultiplier: number;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const SETTINGS_KEY = 'verba_settings';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeType>('Classic');
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);
  const [fontScale, setFontScaleState] = useState<FontScaleType>('Medium');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.theme) setThemeNameState(parsed.theme);
          if (parsed.darkMode !== undefined) setIsDarkModeState(parsed.darkMode);
          if (parsed.fontScale) setFontScaleState(parsed.fontScale);
        }
      } catch (e) {
        console.error('Failed to load theme settings', e);
      }
    };
    loadSettings();
  }, []);

  const saveSetting = async (key: string, value: any) => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save setting', e);
    }
  };

  const setThemeName = (theme: ThemeType) => {
    setThemeNameState(theme);
    saveSetting('theme', theme);
  };

  const setIsDarkMode = (isDark: boolean) => {
    setIsDarkModeState(isDark);
    saveSetting('darkMode', isDark);
  };

  const setFontScale = (scale: FontScaleType) => {
    setFontScaleState(scale);
    saveSetting('fontScale', scale);
  };

  // Determine current theme colors
  let themeColors = classicThemeColors;
  if (isDarkMode || themeName === 'Midnight') {
    themeColors = midnightThemeColors;
  } else if (themeName === 'Royal') {
    themeColors = royalThemeColors;
  }

  // Map font scale setting to numeric multiplier
  const fontSizeMultiplier = 
    fontScale === 'Small' ? 0.85 : 
    fontScale === 'Large' ? 1.25 : 1.0;

  return (
    <ThemeContext.Provider value={{
      themeName,
      isDarkMode,
      fontScale,
      themeColors,
      setThemeName,
      setIsDarkMode,
      setFontScale,
      fontSizeMultiplier
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
