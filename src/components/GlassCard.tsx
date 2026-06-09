import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing } from '../styles/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
  intensity?: number;
}

/**
 * Glass surface card. Background blur is clipped to border radius;
 * content layer uses overflow visible so icons, pulse rings, and
 * decorative elements are not cut off.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = spacing.containerPadding,
  borderRadius = rounded.xl,
  intensity = 40,
}) => {
  const { themeColors, isDarkMode } = useTheme();
  const borderColor = 'rgba(255, 255, 255, 0.35)';

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: 'rgba(79, 70, 229, 0.08)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 32,
    },
    android: { elevation: 4 },
  });

  return (
    <View style={[styles.outer, { borderRadius }, shadowStyle, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint={isDarkMode ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              backgroundColor: themeColors.surfaceContainerLowest + 'D9',
            },
          ]}
        />
      )}

      <View
        style={[
          styles.content,
          {
            padding,
            borderRadius,
            borderColor,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    overflow: 'visible',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
    borderWidth: 0.5,
  },
});
