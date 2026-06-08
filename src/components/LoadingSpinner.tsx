import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing } from '../styles/theme';

interface LoadingSpinnerProps {
  message?: string;
  isSkeleton?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, isSkeleton = true }) => {
  const { themeColors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isSkeleton) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 0.9,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSkeleton]);

  if (!isSkeleton) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        {message && (
          <Text style={[styles.messageText, { color: themeColors.onSurfaceVariant }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[
        styles.skeletonHeader, 
        { backgroundColor: themeColors.surfaceContainerHigh, opacity: shimmerAnim }
      ]} />
      <Animated.View style={[
        styles.skeletonBadge, 
        { backgroundColor: themeColors.surfaceContainerHigh, opacity: shimmerAnim }
      ]} />
      
      <View style={styles.definitionStack}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.definitionRow}>
            <Animated.View style={[
              styles.barIndicator, 
              { backgroundColor: themeColors.primary, opacity: shimmerAnim }
            ]} />
            <View style={styles.lines}>
              <Animated.View style={[
                styles.skeletonLineLong, 
                { backgroundColor: themeColors.surfaceContainerHigh, opacity: shimmerAnim }
              ]} />
              <Animated.View style={[
                styles.skeletonLineShort, 
                { backgroundColor: themeColors.surfaceContainerHigh, opacity: shimmerAnim }
              ]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding,
  },
  messageText: {
    marginTop: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
    padding: spacing.containerPadding,
  },
  skeletonHeader: {
    width: '60%',
    height: 40,
    borderRadius: rounded.default,
    marginBottom: 12,
  },
  skeletonBadge: {
    width: '30%',
    height: 24,
    borderRadius: rounded.full,
    marginBottom: 32,
  },
  definitionStack: {
    marginTop: 16,
  },
  definitionRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  barIndicator: {
    width: 2,
    height: 56,
    borderRadius: rounded.full,
    marginRight: 16,
  },
  lines: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  skeletonLineLong: {
    width: '95%',
    height: 18,
    borderRadius: rounded.sm,
  },
  skeletonLineShort: {
    width: '60%',
    height: 14,
    borderRadius: rounded.sm,
  },
});
