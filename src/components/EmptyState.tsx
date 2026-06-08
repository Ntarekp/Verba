import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: any;
  /** Omit extra horizontal padding when parent already insets content (e.g. FlatList). */
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = 'auto-awesome',
  compact = false,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.iconBox, { backgroundColor: themeColors.surfaceContainerLow }]}>
        <MaterialIcons name={icon} size={36} color={themeColors.outline} />
      </View>
      <Text style={[
        styles.title, 
        { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.desc,
        compact && styles.descCompact,
        { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
      ]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.stackLg * 1.5,
    paddingHorizontal: spacing.containerPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerCompact: {
    paddingHorizontal: 0,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: rounded.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
    opacity: 0.8,
  },
  descCompact: {
    maxWidth: '100%',
    width: '100%',
  },
});
