import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PronunciationButton } from './PronunciationButton';
import { GlassCard } from './GlassCard';
import { rounded, spacing, typography } from '../styles/theme';

interface WordCardProps {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  audioUrl: string | null;
  isSaved: boolean;
  onPlay: () => void;
  onToggleSave: () => void;
  savedCollection?: string;
  badgeLabel?: string;
  definition?: string;
  example?: string;
  isAudioPlaying?: boolean;
  isAudioPaused?: boolean;
  isAudioLoading?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  phonetic,
  partOfSpeech,
  audioUrl,
  isSaved,
  onPlay,
  onToggleSave,
  savedCollection,
  badgeLabel,
  definition,
  example,
  isAudioPlaying = false,
  isAudioPaused = false,
  isAudioLoading = false,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  const headerLabel = badgeLabel
    ? badgeLabel
    : savedCollection
      ? `Saved in ${savedCollection}`
      : 'DICTIONARY DEFINITION';

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[styles.gradientOverlay, { backgroundColor: themeColors.primaryFixedDim + '0A' }]}
        pointerEvents="none"
      />

      <GlassCard style={styles.card} padding={spacing.containerPadding} borderRadius={rounded.xl}>
        <View style={styles.headerRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.labelCaps,
                {
                  color: themeColors.primary,
                  fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {headerLabel}
            </Text>
            <Text
              style={[
                styles.displayWord,
                {
                  color: themeColors.onSurface,
                  fontSize: typography.displayWordMobile.fontSize * fontSizeMultiplier,
                },
              ]}
              numberOfLines={3}
            >
              {word}
            </Text>
          </View>

          <PronunciationButton
            audioUrl={audioUrl}
            onPress={onPlay}
            isPlaying={isAudioPlaying}
            isPaused={isAudioPaused}
            isLoading={isAudioLoading}
            size={48}
          />
        </View>

        {definition ? (
          <View style={styles.definitionBlock}>
            <View style={[styles.definitionBar, { backgroundColor: themeColors.primary }]} />
            <View style={styles.definitionContent}>
              <Text
                style={[
                  styles.definitionText,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.definitionBody.fontSize * 0.9 * fontSizeMultiplier,
                  },
                ]}
              >
                {definition}
              </Text>
              {example ? (
                <Text
                  style={[
                    styles.exampleText,
                    {
                      color: themeColors.onSurfaceVariant,
                      fontSize: typography.caption.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  "{example}"
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.metaContainer}>
            <View
              style={[
                styles.badge,
                {
                  borderColor: themeColors.secondary + '40',
                  backgroundColor: themeColors.secondary + '0A',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: themeColors.secondary,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                {partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1)}
              </Text>
            </View>
            {phonetic ? (
              <Text
                style={[
                  styles.phoneticText,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={2}
              >
                {phonetic}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: isSaved ? themeColors.secondary + '1A' : 'transparent' },
            ]}
            onPress={onToggleSave}
            activeOpacity={0.7}
            accessibilityLabel={isSaved ? 'Remove from saved words' : 'Save this word'}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={isSaved ? themeColors.secondary : themeColors.outline}
            />
            <Text
              style={[
                styles.saveText,
                {
                  color: isSaved ? themeColors.secondary : themeColors.onSurfaceVariant,
                  fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: spacing.stackLg,
    overflow: 'visible',
  },
  card: {
    width: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.stackMd,
    gap: spacing.stackSm,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.stackSm,
  },
  labelCaps: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  displayWord: {
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
    marginTop: spacing.stackSm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  phoneticText: {
    fontFamily: 'Inter',
    flexShrink: 1,
    opacity: 0.8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: rounded.default,
    flexShrink: 0,
  },
  saveText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  definitionBlock: {
    flexDirection: 'row',
    marginTop: spacing.stackSm,
    marginBottom: spacing.stackSm,
  },
  definitionBar: {
    width: 3,
    borderRadius: 99,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  definitionContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
  },
  definitionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 24,
  },
  exampleText: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 6,
    opacity: 0.75,
  },
});
