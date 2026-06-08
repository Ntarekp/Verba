import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { rounded, spacing, typography } from '../../styles/theme';

export const OnboardingSearchSlide: React.FC = () => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View style={styles.canvas}>
      <View style={[styles.glow, { backgroundColor: themeColors.primaryContainer + '18' }]} />

      <View style={styles.mockStack}>
        <GlassCard padding={spacing.stackMd} borderRadius={rounded.lg} style={styles.searchMock}>
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={22} color={themeColors.secondary} />
            <View style={[styles.shimmerTrack, { backgroundColor: themeColors.onSurfaceVariant + '18' }]}>
              <View style={[styles.shimmerFill, { backgroundColor: themeColors.primary }]} />
            </View>
          </View>
        </GlassCard>

        <GlassCard padding={spacing.stackMd} borderRadius={rounded.xl} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultTextCol}>
              <Text style={[styles.posLabel, { color: themeColors.secondary }]}>NOUN</Text>
              <Text
                style={[
                  styles.resultWord,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.sectionHeading.fontSize * 0.65 * fontSizeMultiplier,
                  },
                ]}
              >
                Luminescence
              </Text>
            </View>
            <View style={[styles.audioDot, { backgroundColor: themeColors.tertiaryFixed + '4D' }]}>
              <MaterialIcons name="volume-up" size={20} color={themeColors.tertiary} />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.primary + '33' }]} />
          <Text style={[styles.example, { color: themeColors.onSurfaceVariant }]}>
            "The spontaneous emission of light by a substance not resulting from heat."
          </Text>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { borderColor: themeColors.secondary + '33' }]}>
              <Text style={[styles.chipText, { color: themeColors.secondary }]}>SCIENTIFIC</Text>
            </View>
            <View style={[styles.chip, { borderColor: themeColors.tertiary + '33' }]}>
              <Text style={[styles.chipText, { color: themeColors.tertiary }]}>LATIN ROOT</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding={12} borderRadius={rounded.lg} style={styles.boltBadge}>
          <MaterialIcons name="bolt" size={20} color={themeColors.secondary} />
          <Text style={[styles.boltText, { color: themeColors.onSurface }]}>12ms Response</Text>
        </GlassCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.stackMd,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    width: '90%',
    height: '80%',
    borderRadius: 40,
  },
  mockStack: {
    width: '90%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  searchMock: {
    marginBottom: spacing.stackMd,
    width: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shimmerTrack: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerFill: {
    width: '33%',
    height: '100%',
    borderRadius: 8,
  },
  resultCard: {
    marginLeft: spacing.stackMd,
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.stackSm,
  },
  resultTextCol: {
    flex: 1,
    minWidth: 0,
  },
  posLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  resultWord: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginTop: 2,
  },
  audioDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  divider: {
    height: 2,
    marginVertical: spacing.stackSm,
  },
  example: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.stackMd,
  },
  chip: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  boltBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.stackMd,
    marginLeft: -4,
  },
  boltText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
