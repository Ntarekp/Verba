import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { rounded, spacing, typography } from '../../styles/theme';

export const OnboardingFinalSlide: React.FC = () => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View style={styles.canvas}>
      <GlassCard padding={spacing.containerPadding} borderRadius={rounded.xl * 1.5} style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: themeColors.primary }]}>WORD OF THE DAY</Text>
          <View style={[styles.audioBtn, { backgroundColor: themeColors.tertiaryFixed + '33' }]}>
            <MaterialIcons name="volume-up" size={20} color={themeColors.tertiary} />
          </View>
        </View>
        <Text style={[styles.word, { color: themeColors.onSurface, fontSize: typography.displayWordMobile.fontSize * 0.75 * fontSizeMultiplier }]}>
          Ethereal
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { borderColor: themeColors.secondary + '33' }]}>
            <Text style={[styles.badgeText, { color: themeColors.secondary }]}>Adjective</Text>
          </View>
          <Text style={[styles.phonetic, { color: themeColors.onSurfaceVariant }]}>/ɪˈθɪəriəl/</Text>
        </View>
        <View style={styles.definitionRow}>
          <View style={[styles.bar, { backgroundColor: themeColors.primary }]} />
          <Text style={[styles.definition, { color: themeColors.onSurface, fontSize: typography.definitionBody.fontSize * 0.85 * fontSizeMultiplier }]}>
            Extremely delicate and light in a way that seems not to be of this world.
          </Text>
        </View>
        <Text style={[styles.example, { color: themeColors.onSurfaceVariant }]}>
          "Her ethereal beauty seemed to glow in the dim light of the church."
        </Text>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    paddingHorizontal: spacing.gutter,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.stackSm,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  audioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: spacing.stackSm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.stackMd,
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
  },
  phonetic: {
    fontFamily: 'Inter',
    fontSize: 13,
  },
  definitionRow: {
    flexDirection: 'row',
    marginBottom: spacing.stackSm,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    marginRight: 12,
  },
  definition: {
    flex: 1,
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  example: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontStyle: 'italic',
    paddingLeft: 15,
    opacity: 0.8,
  },
});
