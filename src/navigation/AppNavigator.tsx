import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { WordDetailsScreen } from '../screens/WordDetailsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SavedWordsScreen } from '../screens/SavedWordsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { DrawerContent } from './DrawerContent';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
  Onboarding: undefined;
  MainDrawer: undefined;
  WordDetails: { word: string };
};

export type DrawerParamList = {
  Discover: undefined;
  SavedWords: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const FIRST_LAUNCH_KEY = 'verba_first_launch_done';

function DrawerNavigator() {
  const { themeColors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: themeColors.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: themeColors.primary,
        headerTitleStyle: {
          fontFamily: 'Inter',
          fontWeight: '700',
          fontSize: 20,
        },
        drawerStyle: {
          width: 300,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      }}
    >
      <Drawer.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={{ title: 'Verba' }}
      />
      <Drawer.Screen 
        name="SavedWords" 
        component={SavedWordsScreen} 
        options={{ title: 'Saved Words' }}
      />
      <Drawer.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Search History' }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
}

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainDrawer' | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (value === 'true') {
          setInitialRoute('MainDrawer');
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (e) {
        setInitialRoute('MainDrawer');
      }
    };
    checkFirstLaunch();
  }, []);

  if (initialRoute === null) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
      <Stack.Screen name="WordDetails" component={WordDetailsScreen} />
    </Stack.Navigator>
  );
};
export default AppNavigator;
