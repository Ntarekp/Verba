import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DictionaryStackParamList } from '../navigation/AppNavigator';
import { lookupWord } from '../services/dictionaryService';
import { DictionaryEntry } from '../models/DictionaryTypes';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { getAutoplayEnabled } from '../utils/settingsHelper';
import {
  buildPronunciationTips,
  buildRelatedWords,
  getAccentShortLabel,
  getValidPhonetics,
} from '../utils/pronunciationHelpers';
import { CollectionPicker, CollectionType } from '../components/CollectionPicker';
import { GlassCard } from '../components/GlassCard';
import { PronunciationButton } from '../components/PronunciationButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AudioProgressBar } from '../components/audio/AudioProgressBar';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<DictionaryStackParamList, 'AudioExperience'>;

const SPEED_OPTIONS = [0.75, 1, 1.25] as const;
const BAR_HEIGHTS = [12, 20, 28, 36, 44, 32, 24, 40, 48, 36, 28, 20];

export const AudioExperienceScreen: React.FC<Props> = ({ route, navigation }) => {
  const [word, setWord] = useState(route.params.word);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [selectedPhoneticIndex, setSelectedPhoneticIndex] = useState(
    route.params.phoneticIndex ?? 0
  );
  const [noteText, setNoteText] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);

  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentMaxWidth = Math.min(windowWidth - spacing.containerPadding * 2, 560);

  const { savedWords, addSavedWord, removeSavedWord, updateWordNotes } = useSaved();
  const { addHistoryWord } = useHistory();
  const { isGuest } = useAuth();
  const {
    playAudio,
    stopAudio,
    togglePlayPause,
    replayAudio,
    setPlaybackRate,
    isPlaying,
    isPaused,
    isLoading: isAudioLoading,
    currentUrl,
    positionMillis,
    durationMillis,
    playbackRate,
  } = useAudio();

  const waveAnims = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.6))).current;

  const savedItem = savedWords.find((w) => w.word.toLowerCase() === word.toLowerCase());
  const isSaved = !!savedItem;

  const availablePhonetics = entry ? getValidPhonetics(entry) : [];
  const activeAudioUrl = availablePhonetics[selectedPhoneticIndex]?.audio || null;
  const isCurrentlySelected = currentUrl === activeAudioUrl;
  const displayPhonetic =
    availablePhonetics[selectedPhoneticIndex]?.text ||
    entry?.phonetic ||
    entry?.phonetics.find((p) => p.text)?.text ||
    '';

  const relatedWords = entry ? buildRelatedWords(entry) : { synonyms: [], antonyms: [] };
  const tips = buildPronunciationTips(displayPhonetic, word);
  const displayWord = word.charAt(0).toUpperCase() + word.slice(1);

  const fetchDetails = useCallback(
    async (searchWord: string, phoneticIdx: number) => {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await lookupWord(searchWord);
        setEntry(data);

        const valid = getValidPhonetics(data);
        const safeIndex = Math.min(phoneticIdx, Math.max(0, valid.length - 1));
        setSelectedPhoneticIndex(safeIndex);

        const match = savedWords.find(
          (w) => w.word.toLowerCase() === searchWord.toLowerCase()
        );
        setNoteText(match?.learningNotes || '');

        const primaryMeaning = data.meanings[0];
        const summary = primaryMeaning?.definitions[0]?.definition || '';
        const partOfSpeech = primaryMeaning?.partOfSpeech || 'noun';
        addHistoryWord(data.word, partOfSpeech, summary);

        if (valid.length > 0) {
          const autoplay = await getAutoplayEnabled();
          if (autoplay && valid[safeIndex]?.audio) {
            await playAudio(valid[safeIndex].audio);
          }
        }
      } catch (e: any) {
        console.error(e);
        setFetchError(e?.message || 'Failed to load word');
        setEntry(null);
      } finally {
        setLoading(false);
      }
    },
    [savedWords, addHistoryWord, playAudio]
  );

  useEffect(() => {
    setWord(route.params.word);
    fetchDetails(route.params.word, route.params.phoneticIndex ?? 0);
  }, [route.params.word, route.params.phoneticIndex]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  useEffect(() => {
    if (isPlaying && isCurrentlySelected) {
      const loops = waveAnims.map((anim, i) =>
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
    }
    waveAnims.forEach((anim) => anim.setValue(0.6));
  }, [isPlaying, isCurrentlySelected, waveAnims]);

  const handlePlayAudio = () => {
    if (!activeAudioUrl) {
      Alert.alert('Pronunciation Unavailable', 'No voice recordings found for this entry.');
      return;
    }
    togglePlayPause(activeAudioUrl);
  };

  const handleSelectPhonetic = (index: number) => {
    if (index === selectedPhoneticIndex) return;
    stopAudio();
    setSelectedPhoneticIndex(index);
  };

  const handleToggleSave = () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Saving words is only available for registered users. Would you like to sign in?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            },
          },
        ]
      );
      return;
    }
    if (!entry) return;
    if (isSaved) {
      removeSavedWord(entry.word);
    } else {
      setCollectionPickerVisible(true);
    }
  };

  const handleCollectionSelect = (collection: CollectionType) => {
    if (!entry) return;
    const primaryMeaning = entry.meanings[0];
    const partOfSpeech = primaryMeaning?.partOfSpeech || 'noun';
    const summary = primaryMeaning?.definitions[0]?.definition || '';
    const audioUrl =
      availablePhonetics[selectedPhoneticIndex]?.audio ??
      entry.phonetics.find((p) => p.audio?.trim())?.audio;
    const exampleSentence = primaryMeaning?.definitions[0]?.example;
    addSavedWord(
      entry.word,
      entry.phonetic,
      partOfSpeech,
      summary,
      collection,
      audioUrl,
      exampleSentence
    );
  };

  const handleSaveNotes = () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Personal notes are only available for registered users.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (!entry) return;
    if (!isSaved) {
      Alert.alert(
        'Save Word First',
        'Please bookmark this word to save notes associated with it.'
      );
      return;
    }
    updateWordNotes(entry.word, noteText);
    Alert.alert('Notes Saved', `Mnemonic notes saved for "${entry.word}".`);
  };

  const handleRelatedWord = (newWord: string) => {
    stopAudio();
    navigation.setParams({ word: newWord, phoneticIndex: 0 });
  };

  const handleRetryFetch = () => {
    fetchDetails(word, selectedPhoneticIndex);
  };

  const handleRetryAudio = () => {
    if (activeAudioUrl) {
      playAudio(activeAudioUrl);
    }
  };

  const renderTipIcon = (icon?: string) => {
    switch (icon) {
      case 'stress':
        return (
          <View style={[styles.tipDot, { backgroundColor: themeColors.primary }]} />
        );
      case 'schwa':
      case 'aspiration':
      case 'info':
      default:
        return (
          <MaterialIcons
            name={icon === 'aspiration' ? 'record-voice-over' : 'info-outline'}
            size={16}
            color={themeColors.onSurfaceVariant}
          />
        );
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: themeColors.background, paddingTop: insets.top },
        ]}
      >
        <LoadingSpinner message="Loading pronunciation..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              backgroundColor: themeColors.surface + 'E8',
              borderBottomColor: themeColors.outlineVariant + '30',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.navBtn}
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              {
                color: themeColors.primary,
                fontSize: typography.sectionHeading.fontSize * 0.7 * fontSizeMultiplier,
              },
            ]}
            numberOfLines={1}
          >
            Verba
          </Text>
          <TouchableOpacity
            onPress={handleToggleSave}
            style={styles.navBtn}
            accessibilityLabel={isSaved ? 'Remove bookmark' : 'Save word'}
          >
            <MaterialIcons
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={isSaved ? themeColors.secondary : themeColors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 24) + 24,
              alignItems: 'center',
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.inner, { maxWidth: contentMaxWidth, width: '100%' }]}>
            <View style={styles.heroSection}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: themeColors.surfaceContainer,
                    borderColor: themeColors.outlineVariant + '50',
                  },
                ]}
              >
                <MaterialIcons name="volume-up" size={14} color={themeColors.primary} />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: themeColors.primary,
                      fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  Pronunciation Detail
                </Text>
              </View>

              <Text
                style={[
                  styles.displayWord,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.displayWord.fontSize * fontSizeMultiplier,
                    lineHeight: typography.displayWord.lineHeight * fontSizeMultiplier,
                  },
                ]}
                adjustsFontSizeToFit
                numberOfLines={2}
                minimumFontScale={0.75}
              >
                {displayWord}
              </Text>

              {displayPhonetic ? (
                <Text
                  style={[
                    styles.phonetic,
                    {
                      color: themeColors.onSurfaceVariant,
                      fontSize: typography.definitionBody.fontSize * fontSizeMultiplier,
                      lineHeight: typography.definitionBody.lineHeight * fontSizeMultiplier,
                    },
                  ]}
                >
                  {displayPhonetic}
                </Text>
              ) : null}
            </View>

            <GlassCard
              padding={spacing.stackLg}
              borderRadius={rounded.xl * 2}
              style={styles.playerCard}
            >
              <View
                style={[
                  styles.shaderBg,
                  { backgroundColor: themeColors.primaryContainer + '18' },
                ]}
                pointerEvents="none"
              />

              {fetchError ? (
                <View style={styles.errorBlock}>
                  <MaterialIcons name="error-outline" size={48} color={themeColors.error} />
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: themeColors.error,
                        fontSize: typography.caption.fontSize * fontSizeMultiplier,
                      },
                    ]}
                  >
                    {fetchError}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRetryFetch}
                    style={[styles.retryBtn, { backgroundColor: themeColors.primary }]}
                  >
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.playerContent}>
                  {availablePhonetics.length > 1 ? (
                    <View
                      style={[
                        styles.accentSegment,
                        {
                          backgroundColor: themeColors.surfaceContainerHigh,
                          borderColor: themeColors.outlineVariant + '35',
                        },
                      ]}
                    >
                      {availablePhonetics.map((phonetic, index) => {
                        const isSelected = index === selectedPhoneticIndex;
                        return (
                          <TouchableOpacity
                            key={`${phonetic.audio}-${index}`}
                            onPress={() => handleSelectPhonetic(index)}
                            style={[
                              styles.accentOption,
                              isSelected && {
                                backgroundColor: themeColors.primary,
                              },
                            ]}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.accentOptionText,
                                {
                                  color: isSelected
                                    ? themeColors.onPrimary
                                    : themeColors.onSurfaceVariant,
                                  fontSize:
                                    typography.buttonText.fontSize * 0.9 * fontSizeMultiplier,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {getAccentShortLabel(phonetic)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {isPlaying && isCurrentlySelected ? (
                    <View style={styles.waveRow}>
                      {waveAnims.map((anim, i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.waveBar,
                            {
                              backgroundColor: themeColors.primary,
                              height: BAR_HEIGHTS[i],
                              transform: [{ scaleY: anim }],
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.controlsRow}>
                    <View style={styles.heroPlayWrap}>
                      <PronunciationButton
                        audioUrl={activeAudioUrl}
                        onPress={handlePlayAudio}
                        isPlaying={isPlaying && isCurrentlySelected}
                        isPaused={isPaused && isCurrentlySelected}
                        isLoading={isAudioLoading && isCurrentlySelected}
                        size={96}
                        forceEnabled={!!activeAudioUrl}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={replayAudio}
                      disabled={!activeAudioUrl}
                      style={[
                        styles.replayBtn,
                        {
                          borderColor: themeColors.outlineVariant,
                          opacity: activeAudioUrl ? 1 : 0.4,
                        },
                      ]}
                      accessibilityLabel="Replay pronunciation"
                    >
                      <MaterialIcons name="replay" size={28} color={themeColors.primary} />
                    </TouchableOpacity>
                  </View>

                  {!activeAudioUrl && !fetchError ? (
                    <TouchableOpacity onPress={handleRetryAudio} style={styles.audioUnavailable}>
                      <Text
                        style={[
                          styles.audioUnavailableText,
                          { color: themeColors.error, fontSize: typography.caption.fontSize * fontSizeMultiplier },
                        ]}
                      >
                        Audio unavailable. Tap to retry.
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <AudioProgressBar
                    positionMillis={isCurrentlySelected ? positionMillis : 0}
                    durationMillis={isCurrentlySelected ? durationMillis : 0}
                    isLoading={isAudioLoading && isCurrentlySelected}
                  />

                  <View style={styles.speedRow}>
                    {SPEED_OPTIONS.map((rate) => {
                      const isActive = playbackRate === rate;
                      return (
                        <TouchableOpacity
                          key={rate}
                          onPress={() => setPlaybackRate(rate)}
                          style={[
                            styles.speedChip,
                            {
                              backgroundColor: isActive
                                ? themeColors.secondaryContainer
                                : themeColors.surfaceContainer + '80',
                              borderColor: isActive
                                ? 'transparent'
                                : themeColors.outlineVariant + '50',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.speedChipText,
                              {
                                color: isActive
                                  ? themeColors.onSecondaryContainer
                                  : themeColors.onSurfaceVariant,
                                fontSize: typography.caption.fontSize * fontSizeMultiplier,
                              },
                            ]}
                          >
                            {rate}×
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {tips.length > 0 ? (
                    <View style={styles.tipsSection}>
                      <Text
                        style={[
                          styles.sectionLabel,
                          {
                            color: themeColors.onSurfaceVariant,
                            fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                          },
                        ]}
                      >
                        PRONUNCIATION TIPS
                      </Text>
                      <View style={styles.tipsWrap}>
                        {tips.map((tip) => (
                          <View
                            key={tip.id}
                            style={[
                              styles.tipChip,
                              {
                                backgroundColor: themeColors.surfaceContainer + '80',
                                borderColor: themeColors.outlineVariant + '40',
                              },
                            ]}
                          >
                            {renderTipIcon(tip.icon)}
                            <Text
                              style={[
                                styles.tipText,
                                {
                                  color: themeColors.onSurfaceVariant,
                                  fontSize: typography.caption.fontSize * fontSizeMultiplier,
                                },
                              ]}
                              numberOfLines={2}
                            >
                              {tip.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </GlassCard>

            {(relatedWords.synonyms.length > 0 || relatedWords.antonyms.length > 0) && (
              <View style={styles.relatedSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color: themeColors.onSurfaceVariant,
                      fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  RELATED WORDS
                </Text>
                {relatedWords.synonyms.length > 0 ? (
                  <GlassCard padding={spacing.stackMd} style={styles.relatedCard}>
                    <Text
                      style={[
                        styles.relatedSubtitle,
                        { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier },
                      ]}
                    >
                      Synonyms
                    </Text>
                    <View style={styles.chipRow}>
                      {relatedWords.synonyms.map((syn) => (
                        <TouchableOpacity
                          key={syn}
                          onPress={() => handleRelatedWord(syn)}
                          style={[
                            styles.relatedChip,
                            { backgroundColor: themeColors.surfaceContainer },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: themeColors.onSurface,
                                fontSize: typography.caption.fontSize * fontSizeMultiplier,
                              },
                            ]}
                          >
                            {syn}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </GlassCard>
                ) : null}
                {relatedWords.antonyms.length > 0 ? (
                  <GlassCard padding={spacing.stackMd} style={styles.relatedCard}>
                    <Text
                      style={[
                        styles.relatedSubtitle,
                        { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier },
                      ]}
                    >
                      Antonyms
                    </Text>
                    <View style={styles.chipRow}>
                      {relatedWords.antonyms.map((ant) => (
                        <TouchableOpacity
                          key={ant}
                          onPress={() => handleRelatedWord(ant)}
                          style={[
                            styles.relatedChip,
                            { backgroundColor: themeColors.surfaceContainer },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: themeColors.onSurface,
                                fontSize: typography.caption.fontSize * fontSizeMultiplier,
                              },
                            ]}
                          >
                            {ant}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </GlassCard>
                ) : null}
              </View>
            )}

            <View style={styles.notesSection}>
              <TouchableOpacity
                onPress={() => setNotesExpanded((v) => !v)}
                style={styles.notesHeader}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit-note" size={24} color={themeColors.primary} />
                <Text
                  style={[
                    styles.notesTitle,
                    {
                      color: themeColors.onSurface,
                      fontSize: typography.sectionHeading.fontSize * 0.55 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Learning Notes
                </Text>
                <MaterialIcons
                  name={notesExpanded ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={themeColors.onSurfaceVariant}
                />
              </TouchableOpacity>

              {notesExpanded ? (
                <>
                  <GlassCard padding={spacing.stackMd} borderRadius={rounded.xl}>
                    <TextInput
                      style={[
                        styles.notesInput,
                        {
                          color: themeColors.onSurface,
                          fontSize: typography.definitionBody.fontSize * 0.9 * fontSizeMultiplier,
                          lineHeight: typography.definitionBody.lineHeight * 0.9 * fontSizeMultiplier,
                        },
                      ]}
                      multiline
                      numberOfLines={4}
                      placeholder="Add your personal notes or mnemonic devices here..."
                      placeholderTextColor={`${themeColors.outline}A0`}
                      value={noteText}
                      onChangeText={setNoteText}
                      accessibilityLabel="Learning notes input"
                    />
                  </GlassCard>
                  <TouchableOpacity
                    onPress={handleSaveNotes}
                    style={[styles.saveNoteBtn, { backgroundColor: themeColors.secondary }]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.saveNoteBtnText,
                        { fontSize: typography.buttonText.fontSize * fontSizeMultiplier },
                      ]}
                    >
                      Save Note
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
      <CollectionPicker
        visible={collectionPickerVisible}
        onClose={() => setCollectionPickerVisible(false)}
        onSelect={handleCollectionSelect}
        currentCollection={savedItem?.collection}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.stackSm,
    paddingBottom: spacing.stackSm,
    borderBottomWidth: 1,
  },
  navBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.stackMd,
  },
  inner: {
    alignSelf: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.stackLg,
    gap: spacing.stackSm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.full,
    borderWidth: 1,
    marginBottom: spacing.stackSm,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  displayWord: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    width: '100%',
  },
  phonetic: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.85,
    width: '100%',
  },
  playerCard: {
    width: '100%',
    marginBottom: spacing.stackLg,
    overflow: 'hidden',
  },
  shaderBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  playerContent: {
    alignItems: 'center',
    gap: spacing.stackMd,
    width: '100%',
  },
  accentSegment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: rounded.full,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    width: '100%',
  },
  accentOption: {
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm,
    borderRadius: rounded.full,
    minWidth: 0,
    flexShrink: 1,
  },
  accentOptionText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 48,
    gap: 3,
    width: '100%',
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackMd,
    width: '100%',
  },
  heroPlayWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioUnavailable: {
    paddingVertical: spacing.stackSm,
  },
  audioUnavailableText: {
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.stackSm,
    width: '100%',
  },
  speedChip: {
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm,
    borderRadius: rounded.xl,
    borderWidth: 1,
  },
  speedChipText: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  tipsSection: {
    width: '100%',
    gap: spacing.stackSm,
  },
  sectionLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  tipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.stackSm,
  },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm,
    borderRadius: rounded.xl,
    borderWidth: 1,
    maxWidth: '100%',
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipText: {
    fontFamily: 'Inter',
    flexShrink: 1,
  },
  relatedSection: {
    width: '100%',
    gap: spacing.stackSm,
    marginBottom: spacing.stackLg,
  },
  relatedCard: {
    width: '100%',
    marginTop: spacing.stackSm,
  },
  relatedSubtitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: spacing.stackSm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
  },
  relatedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.full,
  },
  chipText: {
    fontFamily: 'Inter',
  },
  notesSection: {
    width: '100%',
    gap: spacing.stackMd,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  notesTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    flex: 1,
  },
  notesInput: {
    fontFamily: 'Inter',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveNoteBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.stackLg,
    paddingVertical: 12,
    borderRadius: rounded.xl,
  },
  saveNoteBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#fff',
  },
  errorBlock: {
    alignItems: 'center',
    gap: spacing.stackMd,
    paddingVertical: spacing.stackLg,
  },
  errorText: {
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.stackLg,
    paddingVertical: 12,
    borderRadius: rounded.xl,
  },
  retryBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#fff',
  },
});
