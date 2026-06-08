import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface ExampleTextProps {
  text: string;
}

export const ExampleText: React.FC<ExampleTextProps> = ({ text }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceContainerLow }]}>
      <Text style={[
        styles.text, 
        { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
      ]}>
        "{text}"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.stackSm,
    padding: spacing.unit * 1.5,
    borderRadius: rounded.default,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 88, 190, 0.15)', // transparent secondary color tint
  },
  text: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    lineHeight: 20,
    opacity: 0.9,
  },
});
