import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { WordDetailsScreen } from '../screens/WordDetailsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SavedWordsScreen } from '../screens/SavedWordsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { VerbaTabBar } from '../components/VerbaTabBar';
import { useTheme } from '../context/ThemeContext';

export type DictionaryStackParamList = {
  Discover: undefined;
  WordDetails: { word: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Dictionary: NavigatorScreenParams<DictionaryStackParamList>;
  History: undefined;
  Saved: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DictionaryStack = createNativeStackNavigator<DictionaryStackParamList>();

const FIRST_LAUNCH_KEY = 'verba_first_launch_done';

function DictionaryStackNavigator() {
  const { themeColors } = useTheme();

  return (
    <DictionaryStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.surface,
        },
        headerTintColor: themeColors.primary,
        headerTitleStyle: {
          fontFamily: 'Inter',
          fontWeight: '700',
          fontSize: 20,
        },
        animation: 'slide_from_right',
      }}
    >
      <DictionaryStack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={({ navigation }) => ({
          title: 'Verba',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 8, padding: 8 }}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="account-circle"
                size={28}
                color={themeColors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <DictionaryStack.Screen
        name="WordDetails"
        component={WordDetailsScreen}
        options={{ headerShown: false }}
      />
      <DictionaryStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </DictionaryStack.Navigator>
  );
}

function MainTabNavigator() {
  const { themeColors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <VerbaTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dictionary"
        component={DictionaryStackNavigator}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerShown: true,
          title: 'Search History',
          headerStyle: { backgroundColor: themeColors.surface },
          headerTintColor: themeColors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '700',
            fontSize: 20,
          },
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedWordsScreen}
        options={{
          headerShown: true,
          title: 'Saved Words',
          headerStyle: { backgroundColor: themeColors.surface },
          headerTintColor: themeColors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '700',
            fontSize: 20,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Main' | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        setInitialRoute(value === 'true' ? 'Main' : 'Onboarding');
      } catch {
        setInitialRoute('Main');
      }
    };
    checkFirstLaunch();
  }, []);

  if (initialRoute === null) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="Main" component={MainTabNavigator} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
