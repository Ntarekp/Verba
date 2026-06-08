import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { HistoryProvider } from './src/context/HistoryContext';
import { SavedProvider } from './src/context/SavedContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { themeColors, isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={themeColors.surface} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <SavedProvider>
          <AppContent />
        </SavedProvider>
      </HistoryProvider>
    </ThemeProvider>
  );
}
