import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { rounded, spacing, typography } from '../../styles/theme';

const BAR_HEIGHTS = [12, 20, 28, 36, 44, 32, 24, 40, 48, 36, 28, 20, 32, 16];

export const OnboardingAudioSlide: React.FC = () => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const animations = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.6))).current;

  useEffect(() => {
    const loops = animations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400 + i * 40,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.5,
            duration: 400 + i * 40,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [animations]);

  return (
    <View style={styles.canvas}>
      <GlassCard padding={spacing.gutter} borderRadius={rounded.xl} style={styles.wordCard}>
        <View style={styles.wordHeader}>
          <View style={styles.wordTextCol}>
            <Text style={[styles.pos, { color: themeColors.secondary }]}>ADJECTIVE</Text>
            <Text
              style={[
                styles.word,
                {
                  color: themeColors.onSurface,
                  fontSize: typography.sectionHeading.fontSize * 0.7 * fontSizeMultiplier,
                },
              ]}
            >
              Eloquent
            </Text>
            <Text style={[styles.phonetic, { color: themeColors.onSurfaceVariant }]}>/ˈeləkwənt/</Text>
          </View>
          <View style={[styles.playBtn, { backgroundColor: themeColors.tertiaryFixed + '40' }]}>
            <MaterialIcons name="volume-up" size={24} color={themeColors.tertiary} />
          </View>
        </View>
      </GlassCard>

      <View style={styles.waveRow}>
        {animations.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: themeColors.tertiary,
                height: BAR_HEIGHTS[i],
                transform: [{ scaleY: anim }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.chipRow}>
        {['Stressed Syllable', 'Glottal Stop'].map((label) => (
          <View key={label} style={[styles.chip, { borderColor: themeColors.tertiary + '40' }]}>
            <Text style={[styles.chipText, { color: themeColors.tertiary }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.stackMd,
    overflow: 'visible',
  },
  wordCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing.stackLg,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.stackSm,
  },
  wordTextCol: {
    flex: 1,
    minWidth: 0,
  },
  pos: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  word: {
    fontFamily: 'Inter',
    fontWeight: '700',
    marginTop: 4,
  },
  phonetic: {
    fontFamily: 'Inter',
    fontSize: 13,
    marginTop: 4,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 64,
    paddingVertical: 12,
    marginBottom: spacing.stackMd,
    overflow: 'visible',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  chip: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
  },
});
