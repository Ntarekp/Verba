import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerbaTabBar } from '../components/VerbaTabBar';
import { DrawerContent } from './DrawerContent';
import { openAppDrawer } from './navigationHelpers';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainDrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DictionaryStack = createNativeStackNavigator<DictionaryStackParamList>();

const FIRST_LAUNCH_KEY = 'verba_first_launch_done';

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => openAppDrawer(navigation)}
              style={{ marginLeft: 8, padding: 8 }}
              accessibilityLabel="Open navigation menu"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="menu"
                size={28}
                color={themeColors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ),
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
      <Tab.Screen name="Dictionary" component={DictionaryStackNavigator} />
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

function MainDrawerNavigator() {
  const { themeColors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: themeColors.surfaceContainer,
        },
        overlayColor: 'rgba(11, 28, 48, 0.25)',
        swipeEdgeWidth: 56,
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}

type BootstrapRoute = keyof RootStackParamList | null;

export const AppNavigator = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bootstrapRoute, setBootstrapRoute] = useState<BootstrapRoute>(null);

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (onboardingDone !== 'true') {
          setBootstrapRoute('Onboarding');
          return;
        }
        setBootstrapRoute(isAuthenticated ? 'Main' : 'Auth');
      } catch {
        setBootstrapRoute(isAuthenticated ? 'Main' : 'Auth');
      }
    };

    if (!authLoading) {
      resolveInitialRoute();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || bootstrapRoute === null) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator
      initialRouteName={bootstrapRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      <RootStack.Screen name="Main" component={MainDrawerNavigator} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
