import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SavedWordItem } from '../models/DictionaryTypes';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { PronunciationButton } from './PronunciationButton';
import { GlassCard } from './GlassCard';
import { lookupWord } from '../services/dictionaryService';
import { rounded, spacing, typography } from '../styles/theme';

interface SavedWordCardProps {
  item: SavedWordItem;
  onPress: () => void;
  onRemove: () => void;
  relativeTime: string;
  onOpenAudioExperience?: (word: string) => void;
}

export const SavedWordCard: React.FC<SavedWordCardProps> = ({
  item,
  onPress,
  onRemove,
  relativeTime,
  onOpenAudioExperience,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { playAudio, togglePlayPause, isPlaying, isPaused, isLoading, currentUrl } = useAudio();
  const [resolvingAudio, setResolvingAudio] = useState(false);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null);

  const activeAudioUrl = item.audioUrl ?? null;
  const effectiveAudioUrl = activeAudioUrl ?? resolvedAudioUrl;

  const posAbbrev =
    item.partOfSpeech.length <= 4
      ? item.partOfSpeech
      : item.partOfSpeech.substring(0, 3);

  const isThisPlaying =
    !!effectiveAudioUrl && currentUrl === effectiveAudioUrl && (isPlaying || isPaused);
  const isThisLoading =
    (!!effectiveAudioUrl && currentUrl === effectiveAudioUrl && isLoading) || resolvingAudio;

  const handlePlay = async () => {
    if (effectiveAudioUrl) {
      togglePlayPause(effectiveAudioUrl);
      return;
    }

    setResolvingAudio(true);
    try {
      const entry = await lookupWord(item.word);
      const url = entry.phonetics.find((p) => p.audio?.trim())?.audio;
      if (url) {
        setResolvedAudioUrl(url);
        await playAudio(url);
      } else {
        Alert.alert('Pronunciation Unavailable', 'No audio found for this word.');
      }
    } catch {
      Alert.alert('Pronunciation Error', 'Could not load pronunciation for this word.');
    } finally {
      setResolvingAudio(false);
    }
  };

  const handleRemovePress = () => {
    Alert.alert(
      'Remove Word',
      `Remove "${item.word}" from your saved collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.cardWrap}>
      <GlassCard padding={spacing.gutter} borderRadius={rounded.xl * 1.5} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleCol}>
            <Text
              style={[
                styles.wordName,
                {
                  color: themeColors.onSurface,
                  fontSize: typography.sectionHeading.fontSize * 0.65 * fontSizeMultiplier,
                  lineHeight:
                    typography.sectionHeading.lineHeight * 0.65 * fontSizeMultiplier,
                },
              ]}
              numberOfLines={2}
            >
              {item.word}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badge,
                  {
                    borderColor: themeColors.primary + '40',
                    backgroundColor: themeColors.primary + '0A',
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: themeColors.primary }]}>
                  {posAbbrev}
                </Text>
              </View>
              {item.phonetic ? (
                <Text
                  style={[
                    styles.phonetic,
                    {
                      color: themeColors.onSurfaceVariant,
                      fontSize: typography.caption.fontSize * fontSizeMultiplier,
                      lineHeight: typography.caption.lineHeight * fontSizeMultiplier,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.phonetic}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onLongPress={() => onOpenAudioExperience?.(item.word)}
              delayLongPress={400}
              onStartShouldSetResponder={() => true}
            >
              <PronunciationButton
                audioUrl={effectiveAudioUrl}
                onPress={handlePlay}
                isPlaying={isThisPlaying && isPlaying}
                isPaused={isThisPlaying && isPaused}
                isLoading={isThisLoading}
                size={40}
                forceEnabled
              />
            </Pressable>
            <TouchableOpacity
              onPress={handleRemovePress}
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Remove ${item.word} from saved words`}
            >
              <MaterialIcons name="bookmark" size={24} color={themeColors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.definitionRow}>
          <View style={[styles.defBar, { backgroundColor: themeColors.primary }]} />
          <Text
            style={[
              styles.definition,
              {
                color: themeColors.onSurface,
                fontSize: typography.definitionBody.fontSize * 0.85 * fontSizeMultiplier,
                lineHeight: typography.definitionBody.lineHeight * 0.85 * fontSizeMultiplier,
              },
            ]}
          >
            {item.definitionSummary}
          </Text>
        </View>

        {item.exampleSentence ? (
          <View
            style={[
              styles.exampleBox,
              { backgroundColor: themeColors.surfaceContainerLow },
            ]}
          >
            <Text
              style={[
                styles.exampleText,
                {
                  color: themeColors.onSurfaceVariant,
                  fontSize: typography.caption.fontSize * fontSizeMultiplier,
                  lineHeight: typography.caption.lineHeight * fontSizeMultiplier,
                },
              ]}
              numberOfLines={3}
            >
              "{item.exampleSentence}"
            </Text>
          </View>
        ) : null}

        <View style={[styles.divider, { backgroundColor: themeColors.outlineVariant + '25' }]} />

        <View style={styles.footer}>
          <Text
            style={[
              styles.dateText,
              {
                color: themeColors.outline,
                fontSize: typography.caption.fontSize * 0.85 * fontSizeMultiplier,
                lineHeight: typography.caption.lineHeight * 0.85 * fontSizeMultiplier,
              },
            ]}
            numberOfLines={1}
          >
            Added {relativeTime}
          </Text>
          <View style={styles.masteryDots}>
            {[1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.masteryDot,
                  {
                    backgroundColor:
                      level <= item.masteryLevel
                        ? themeColors.primary
                        : themeColors.outlineVariant,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: spacing.stackMd,
  },
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.stackSm,
    marginBottom: spacing.stackMd,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
    flexGrow: 1,
  },
  wordName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phonetic: {
    fontFamily: 'Inter',
    flexShrink: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  removeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  definitionRow: {
    flexDirection: 'row',
    marginBottom: spacing.stackMd,
  },
  defBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  definition: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter',
  },
  exampleBox: {
    borderRadius: rounded.lg,
    padding: 12,
    marginBottom: spacing.stackMd,
  },
  exampleText: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginBottom: spacing.stackSm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter',
    marginRight: spacing.stackSm,
  },
  masteryDots: {
    flexDirection: 'row',
    gap: 4,
  },
  masteryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
