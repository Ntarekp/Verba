import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { MainTabParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { rounded, spacing, typography } from '../styles/theme';

type TabConfig = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconActive: keyof typeof MaterialIcons.glyphMap;
};

const TAB_CONFIG: Record<keyof MainTabParamList, TabConfig> = {
  Dictionary: { label: 'Dictionary', icon: 'auto-stories', iconActive: 'auto-stories' },
  History: { label: 'History', icon: 'history', iconActive: 'history' },
  Saved: { label: 'Saved', icon: 'bookmark-border', iconActive: 'bookmark' },
};

export const VerbaTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { themeColors, isDarkMode } = useTheme();
  const { isGuest } = useAuth();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name as keyof MainTabParamList];

        const onPress = () => {
          if (isGuest && (route.name === 'History' || route.name === 'Saved')) {
            Alert.alert(
              'Sign In Required',
              'Searching history and saving words are only available for registered users. Would you like to sign in?',
              [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Sign In',
                  onPress: () => {
                    navigation.getParent()?.reset({
                      index: 0,
                      routes: [{ name: 'Auth' }],
                    });
                  },
                },
              ]
            );
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tab,
              isFocused && {
                backgroundColor: themeColors.secondaryFixed + '33',
                borderRadius: rounded.full,
              },
            ]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={config.label}
          >
            <MaterialIcons
              name={isFocused ? config.iconActive : config.icon}
              size={24}
              color={
                isFocused
                  ? themeColors.secondary
                  : themeColors.onSurfaceVariant + '99'
              }
            />
            <Text
              style={[
                styles.label,
                {
                  color: isFocused
                    ? themeColors.secondary
                    : themeColors.onSurfaceVariant + '99',
                },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderTopColor: 'rgba(255,255,255,0.1)',
          ...Platform.select({
            ios: {
              shadowColor: 'rgba(79, 70, 229, 0.08)',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 1,
              shadowRadius: 20,
            },
            android: { elevation: 12 },
          }),
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={60}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: themeColors.surface + 'CC' },
          ]}
        />
      )}
      <View style={styles.inner}>{content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopLeftRadius: rounded.xl,
    borderTopRightRadius: rounded.xl,
    overflow: 'hidden',
  },
  inner: {
    paddingTop: spacing.stackSm,
    paddingHorizontal: spacing.gutter,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 56,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: typography.labelCaps.fontSize,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});
