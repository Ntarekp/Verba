import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PronunciationButton } from './PronunciationButton';
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
  // Audio playback state — passed from parent's useAudio hook
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
  isAudioPlaying = false,
  isAudioPaused = false,
  isAudioLoading = false,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.surfaceContainerLowest,
          shadowColor: themeColors.primary,
        },
      ]}
    >
      {/* Background radial soft light highlight */}
      <View
        style={[
          styles.gradientOverlay,
          { backgroundColor: themeColors.primaryFixedDim + '0A' },
        ]}
      />

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
            {savedCollection ? `Saved in ${savedCollection}` : 'DICTIONARY DEFINITION'}
          </Text>
          <Text
            style={[
              styles.displayWord,
              {
                color: themeColors.onSurface,
                fontSize: typography.displayWordMobile.fontSize * fontSizeMultiplier,
              },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {word}
          </Text>
        </View>

        {/* Pronunciation button — shows play or pause based on state */}
        <PronunciationButton
          audioUrl={audioUrl}
          onPress={onPlay}
          isPlaying={isAudioPlaying}
          isPaused={isAudioPaused}
          isLoading={isAudioLoading}
        />
      </View>

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
            name={isSaved ? 'star' : 'star-border'}
            size={24}
            color={isSaved ? '#d97706' : themeColors.outline}
          />
          <Text
            style={[
              styles.saveText,
              {
                color: isSaved ? '#d97706' : themeColors.onSurfaceVariant,
                fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
              },
            ]}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: rounded.xl,
    padding: spacing.containerPadding,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: spacing.stackLg,
  },
  gradientOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.stackMd,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
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
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.stackSm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    opacity: 0.8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: rounded.default,
  },
  saveText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
