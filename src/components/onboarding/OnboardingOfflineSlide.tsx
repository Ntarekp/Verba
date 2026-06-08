import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { rounded, spacing } from '../../styles/theme';

export const OnboardingOfflineSlide: React.FC = () => {
  const { themeColors } = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.canvas}>
      <View style={[styles.glow, { backgroundColor: themeColors.secondaryFixed + '30' }]} />
      <Animated.View style={[styles.iconStack, { transform: [{ translateY }] }]}>
        <MaterialIcons name="cloud" size={64} color={themeColors.primary} />
        <MaterialIcons name="arrow-downward" size={28} color={themeColors.primary + '99'} />
        <GlassCard padding={20} borderRadius={rounded.xl}>
          <View style={styles.deviceRow}>
            <MaterialIcons name="tablet-android" size={40} color={themeColors.secondary} />
            <MaterialIcons name="menu-book" size={32} color={themeColors.primary} />
          </View>
        </GlassCard>
        <MaterialIcons name="download" size={24} color={themeColors.tertiary} style={styles.downloadIcon} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '80%',
    height: '70%',
    borderRadius: 40,
  },
  iconStack: {
    alignItems: 'center',
    gap: 12,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  downloadIcon: {
    marginTop: 4,
  },
});
