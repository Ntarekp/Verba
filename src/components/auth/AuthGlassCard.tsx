import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GlassCard } from '../GlassCard';
import { rounded, spacing } from '../../styles/theme';

interface AuthGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AuthGlassCard: React.FC<AuthGlassCardProps> = ({ children, style }) => (
  <View style={[styles.wrap, style]}>
    <GlassCard padding={spacing.containerPadding} borderRadius={rounded.xl * 2}>
      {children}
    </GlassCard>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});
