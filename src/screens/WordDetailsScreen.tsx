import React, { useEffect, useState } from 'react';
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
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { DictionaryStackParamList } from '../navigation/AppNavigator';
import { navigateToSavedTab } from '../navigation/navigationHelpers';
import { lookupWord } from '../services/dictionaryService';
import { DictionaryEntry, Phonetic } from '../models/DictionaryTypes';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GlassCard } from '../components/GlassCard';
import { PronunciationButton } from '../components/PronunciationButton';
import { ErrorView, ErrorViewType } from '../components/ErrorView';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { useAudio } from '../context/AudioContext';
import { getAutoplayEnabled } from '../utils/settingsHelper';
import { getAccentLabel, getValidPhonetics } from '../utils/pronunciationHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { rounded, spacing, typography } from '../styles/theme';
import { CollectionPicker, CollectionType } from '../components/CollectionPicker';

type Props = NativeStackScreenProps<DictionaryStackParamList, 'WordDetails'>;

const DEFAULT_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQL3vR2NpgAGUqV4erNAttdcBhvrO6c6crNnRl4vYigntwZn-Lf24qCaqB6Xvcxy6_BlDsxnhlrzyQYubcdGQgctTqVjKYm9VPMwOr4sDbu5rWRCQKbGfil6Ravjv3CmP8M6MMkgZVkJhu3hpXHWPhX_BiiWLRymbDHSEgvgbbKVz_PAxhuH3lFDB3cKfU8r_Vsm6DTD8MIHkmuRmE7Z0alox3SmEwgXZFn1AIqeMoXEZhoV1a6ORP6JxilRcZmAWYT043hCEAQ';

const formatPartOfSpeech = (pos: string) =>
  pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : 'Noun';

export const WordDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { word: initialWord } = route.params;
  const [word, setWord] = useState(initialWord);

  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { savedWords, addSavedWord, removeSavedWord, updateWordNotes } = useSaved();
  const { addHistoryWord } = useHistory();
  const {
    playAudio,
    stopAudio,
    togglePlayPause,
    isPlaying: isAudioPlaying,
    isPaused: isAudioPaused,
    isLoading: isAudioLoading,
    currentUrl,
  } = useAudio();

  const [loading, setLoading] = useState<boolean>(true);
  const [errorType, setErrorType] = useState<ErrorViewType | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [noteText, setNoteText] = useState('');

  // Activity 3, Req 5: track all available audio phonetics + which one is selected
  const [availablePhonetics, setAvailablePhonetics] = useState<Phonetic[]>([]);
  const [selectedPhoneticIndex, setSelectedPhoneticIndex] = useState<number>(0);
  const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);

  const savedItem = savedWords.find(w => w.word.toLowerCase() === word.toLowerCase());
  const isSaved = !!savedItem;

  const fetchDetails = async (searchWord: string) => {
    try {
      setLoading(true);
      setErrorType(null);
      setAvailablePhonetics([]);
      setSelectedPhoneticIndex(0);

      const data = await lookupWord(searchWord);
      setEntry(data);

      // Extract all phonetics that have valid audio URLs (Activity 3, Req 1 & 5)
      const validPhonetics = getValidPhonetics(data);
      setAvailablePhonetics(validPhonetics);

      // Activity 3 + Settings: autoplay first pronunciation when enabled
      if (validPhonetics.length > 0) {
        const autoplay = await getAutoplayEnabled();
        if (autoplay && validPhonetics[0].audio) {
          playAudio(validPhonetics[0].audio);
        }
      }

      // Load saved notes if word is already bookmarked
      const match = savedWords.find(
        w => w.word.toLowerCase() === searchWord.toLowerCase()
      );
      setNoteText(match?.learningNotes || '');

      // Add to search history (Activity 4, Req 3)
      const primaryMeaning = data.meanings[0];
      const summary = primaryMeaning?.definitions[0]?.definition || '';
      const partOfSpeech = primaryMeaning?.partOfSpeech || 'noun';
      addHistoryWord(data.word, partOfSpeech, summary);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'INVALID_QUERY') {
        Alert.alert('Invalid Search', 'Please enter a valid word (letters and hyphens only).');
        navigation.goBack();
        return;
      }
      if (e.message === 'WORD_NOT_FOUND') {
        setErrorType('404');
      } else if (e.message === 'NETWORK_OFFLINE') {
        setErrorType('offline');
      } else if (e.message === 'NETWORK_TIMEOUT' || e.message === 'SERVER_TIMEOUT') {
        setErrorType('timeout');
      } else if (e.message === 'CONNECTION_ERROR') {
        setErrorType('connection_error');
      } else if (e.message === 'UNKNOWN_ERROR') {
        setErrorType('unexpected');
      } else if (e.message === 'EMPTY_RESPONSE' || e.message === 'EMPTY_QUERY') {
        setErrorType('server');
      } else if (e.message === 'SERVER_ERROR') {
        setErrorType('server');
      } else {
        setErrorType('unexpected');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync when navigation passes a new word (Activity 4 — history re-search)
  useEffect(() => {
    if (route.params.word !== word) {
      setWord(route.params.word);
    }
  }, [route.params.word]);

  useEffect(() => {
    let cancelled = false;

    const loadWord = async () => {
      await stopAudio();
      if (!cancelled) {
        fetchDetails(word);
      }
    };

    loadWord();

    return () => {
      cancelled = true;
    };
  }, [word]);

  // Activity 3 Req 7: stop audio when leaving the screen
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Activity 3, Req 4 & 7: play/pause toggle for selected pronunciation
  const handlePlayAudio = () => {
    const selectedPhonetic = availablePhonetics[selectedPhoneticIndex];
    if (!selectedPhonetic?.audio) {
      Alert.alert(
        'Pronunciation Unavailable',
        'No voice recordings found for this entry.'
      );
      return;
    }
    togglePlayPause(selectedPhonetic.audio);
  };

  // Activity 3, Req 5: switch to a different accent pronunciation
  const handleSelectPhonetic = (index: number) => {
    if (index === selectedPhoneticIndex) return;
    stopAudio();
    setSelectedPhoneticIndex(index);
  };

  const handleToggleSave = () => {
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
      entry.phonetics.find((p) => p.audio?.trim())?.audio ??
      availablePhonetics[0]?.audio;
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

  const handleSelectRelatedWord = (newWord: string) => {
    // Clear current entry and route to the same details route so navigation history is consistent
    setLoading(true);
    setEntry(null);
    navigation.setParams({ word: newWord, phoneticIndex: 0 });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
        <LoadingSpinner message="Searching lexicographic records..." />
      </View>
    );
  }

  if (errorType) {
    return (
      <ErrorView
        type={errorType}
        query={word}
        savedCount={savedWords.length}
        onRetry={() => fetchDetails(word)}
        onBack={() => navigation.goBack()}
        onSearchNew={(newWord) => {
          setWord(newWord);
          navigation.setParams({ word: newWord });
        }}
        onNavigateToSaved={
          errorType === 'offline'
            ? () => {
                navigation.goBack();
                navigateToSavedTab(navigation);
              }
            : undefined
        }
      />
    );
  }

  if (!entry) return null;

  // The audio URL currently selected for playback
  const activeAudioUrl = availablePhonetics[selectedPhoneticIndex]?.audio || null;

  // Determine if the currently-playing URL matches the selected phonetic
  const isCurrentlySelected = currentUrl === activeAudioUrl;

  const primaryPos = entry.meanings[0]?.partOfSpeech || 'noun';
  const displayPhonetic =
    entry.phonetic ||
    availablePhonetics[selectedPhoneticIndex]?.text ||
    entry.phonetics.find((p) => p.text)?.text ||
    '';

  const allDefinitions = entry.meanings.flatMap((meaning) =>
    meaning.definitions.map((def) => ({ ...def, partOfSpeech: meaning.partOfSpeech }))
  );

  const synonyms = Array.from(
    new Set(
      entry.meanings.flatMap((m) => [
        ...(m.synonyms || []),
        ...m.definitions.flatMap((d) => d.synonyms || []),
      ])
    )
  ).slice(0, 8);

  const antonyms = Array.from(
    new Set(
      entry.meanings.flatMap((m) => [
        ...(m.antonyms || []),
        ...m.definitions.flatMap((d) => d.antonyms || []),
      ])
    )
  ).slice(0, 8);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Custom Header Nav */}
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
            accessibilityRole="button"
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Verba</Text>
          <TouchableOpacity
            style={styles.navBtn}
            accessibilityLabel="More options"
            accessibilityRole="button"
          >
            <MaterialIcons name="more-vert" size={24} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wordHeader}>
            <Text
              style={[
                styles.displayWord,
                {
                  color: themeColors.primary,
                  fontSize: typography.displayWord.fontSize * 0.85 * fontSizeMultiplier,
                },
              ]}
            >
              {entry.word.charAt(0).toUpperCase() + entry.word.slice(1)}
            </Text>

            <View style={styles.phoneticRow}>
              {displayPhonetic ? (
                <Text style={[styles.phoneticText, { color: themeColors.onSurfaceVariant }]}>
                  {displayPhonetic}
                </Text>
              ) : null}
              <PronunciationButton
                audioUrl={activeAudioUrl}
                onPress={handlePlayAudio}
                isPlaying={isAudioPlaying && isCurrentlySelected}
                isPaused={isAudioPaused && isCurrentlySelected}
                isLoading={isAudioLoading && isCurrentlySelected}
                size={40}
              />
            </View>

            {availablePhonetics.length > 0 ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AudioExperience', {
                    word: entry.word,
                    phoneticIndex: selectedPhoneticIndex,
                  })
                }
                style={[
                  styles.immersiveLink,
                  {
                    backgroundColor: themeColors.primaryContainer + '20',
                    borderColor: themeColors.primary + '30',
                  },
                ]}
                activeOpacity={0.8}
                accessibilityLabel="Open immersive pronunciation experience"
              >
                <MaterialIcons name="spatial-audio-off" size={20} color={themeColors.primary} />
                <Text
                  style={[
                    styles.immersiveLinkText,
                    {
                      color: themeColors.primary,
                      fontSize: typography.buttonText.fontSize * 0.9 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Immersive Pronunciation
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={themeColors.primary} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.posSaveRow}>
              <View
                style={[
                  styles.posPill,
                  { borderColor: themeColors.primary, backgroundColor: themeColors.primary + '08' },
                ]}
              >
                <Text style={[styles.posPillText, { color: themeColors.primary }]}>
                  {formatPartOfSpeech(primaryPos)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleSave}
                style={styles.saveBtn}
                accessibilityLabel={isSaved ? 'Remove bookmark' : 'Save word'}
              >
                <MaterialIcons
                  name={isSaved ? 'bookmark' : 'bookmark-border'}
                  size={22}
                  color={isSaved ? themeColors.secondary : themeColors.onSurfaceVariant}
                />
                <Text style={[styles.saveBtnText, { color: themeColors.onSurfaceVariant }]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {availablePhonetics.length > 1 ? (
            <View style={styles.accentSection}>
              <Text
                style={[
                  styles.accentLabel,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                PRONUNCIATIONS
              </Text>
              <View style={styles.accentChips}>
                {availablePhonetics.map((phonetic, index) => {
                  const isSelected = index === selectedPhoneticIndex;
                  const accentLabel = getAccentLabel(phonetic);
                  return (
                    <TouchableOpacity
                      key={`${phonetic.audio}-${index}`}
                      onPress={() => handleSelectPhonetic(index)}
                      style={[
                        styles.accentChip,
                        {
                          backgroundColor: isSelected
                            ? themeColors.secondaryContainer
                            : themeColors.surfaceContainerLowest,
                          borderColor: isSelected
                            ? 'transparent'
                            : themeColors.outlineVariant + '60',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.accentChipText,
                          {
                            color: isSelected
                              ? themeColors.onSecondaryContainer
                              : themeColors.onSurfaceVariant,
                            fontWeight: isSelected ? '600' : '500',
                          },
                        ]}
                      >
                        {accentLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.heroImageWrap}>
            <Image
              source={{ uri: DEFAULT_HERO_IMAGE }}
              style={styles.heroImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View
              style={[
                styles.heroGradient,
                { backgroundColor: themeColors.background + '00' },
              ]}
            />
            <View
              style={[
                styles.heroGradientBottom,
                { backgroundColor: themeColors.background + 'E6' },
              ]}
            />
          </View>

          <View
            style={[
              styles.definitionsBlock,
              { borderLeftColor: themeColors.primary },
            ]}
          >
            {allDefinitions.map((def, idx) => (
              <View key={idx} style={styles.definitionItem}>
                <Text
                  style={[
                    styles.definitionText,
                    {
                      color: themeColors.onBackground,
                      fontSize: typography.definitionBody.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  <Text style={[styles.defNumber, { color: themeColors.primary }]}>
                    {idx + 1}.{' '}
                  </Text>
                  {def.definition}
                </Text>
                {def.example ? (
                  <Text
                    style={[
                      styles.exampleText,
                      {
                        color: themeColors.onSurfaceVariant,
                        fontSize: typography.definitionBody.fontSize * 0.9 * fontSizeMultiplier,
                      },
                    ]}
                  >
                    "{def.example}"
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          {entry.origin ? (
            <GlassCard style={styles.originCard} padding={spacing.containerPadding}>
              <View style={styles.originHeader}>
                <MaterialIcons name="history-edu" size={22} color={themeColors.secondary} />
                <Text
                  style={[
                    styles.originTitle,
                    {
                      color: themeColors.secondary,
                      fontSize: typography.sectionHeading.fontSize * 0.55 * fontSizeMultiplier,
                    },
                  ]}
                >
                  Word Origin
                </Text>
              </View>
              <Text
                style={[
                  styles.originText,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                {entry.origin}
              </Text>
            </GlassCard>
          ) : null}

          {(synonyms.length > 0 || antonyms.length > 0) && (
            <View style={styles.thesaurusGrid}>
              {synonyms.length > 0 ? (
                <GlassCard style={styles.thesaurusCard} padding={spacing.stackMd}>
                  <Text style={[styles.thesaurusLabel, { color: themeColors.onSurfaceVariant }]}>
                    Synonyms
                  </Text>
                  <View style={styles.chipRow}>
                    {synonyms.map((syn) => (
                      <TouchableOpacity
                        key={syn}
                        onPress={() => handleSelectRelatedWord(syn)}
                        style={[
                          styles.thesaurusChip,
                          { backgroundColor: themeColors.surfaceContainer },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: themeColors.onSurface }]}>
                          {syn}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </GlassCard>
              ) : null}
              {antonyms.length > 0 ? (
                <GlassCard style={styles.thesaurusCard} padding={spacing.stackMd}>
                  <Text style={[styles.thesaurusLabel, { color: themeColors.onSurfaceVariant }]}>
                    Antonyms
                  </Text>
                  <View style={styles.chipRow}>
                    {antonyms.map((ant) => (
                      <TouchableOpacity
                        key={ant}
                        onPress={() => handleSelectRelatedWord(ant)}
                        style={[
                          styles.thesaurusChip,
                          { backgroundColor: themeColors.surfaceContainer },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: themeColors.onSurface }]}>
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
            <View style={styles.notesHeader}>
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
            </View>
            <GlassCard padding={spacing.stackMd} borderRadius={rounded.xl}>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.definitionBody.fontSize * 0.9 * fontSizeMultiplier,
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
            <View style={styles.notesActions}>
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
  centerContainer: {
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
    minHeight: 56,
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
    fontSize: 20,
  },
  scrollContent: {
    padding: spacing.containerPadding,
  },
  wordHeader: {
    alignItems: 'center',
    marginBottom: spacing.stackLg,
  },
  displayWord: {
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: spacing.stackSm,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.stackSm,
  },
  immersiveLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.stackMd,
    borderRadius: rounded.full,
    borderWidth: 1,
    marginBottom: spacing.stackMd,
    alignSelf: 'center',
  },
  immersiveLinkText: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  phoneticText: {
    fontFamily: 'Inter',
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic',
  },
  posSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackMd,
  },
  posPill: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  posPillText: {
    fontFamily: 'Inter',
    fontSize: typography.labelCaps.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  saveBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
  },
  heroImageWrap: {
    width: '100%',
    height: 220,
    borderRadius: rounded.xl,
    overflow: 'hidden',
    marginBottom: spacing.stackLg,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  definitionsBlock: {
    borderLeftWidth: 2,
    paddingLeft: spacing.stackMd,
    marginBottom: spacing.stackLg,
    gap: spacing.stackMd,
  },
  definitionItem: {
    gap: 6,
  },
  definitionText: {
    fontFamily: 'Inter',
    lineHeight: 28,
  },
  defNumber: {
    fontWeight: '700',
  },
  exampleText: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    paddingLeft: 20,
    lineHeight: 26,
    opacity: 0.85,
  },
  accentSection: {
    marginBottom: spacing.stackLg,
  },
  accentLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  accentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accentChip: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  accentChipText: {
    fontFamily: 'Inter',
  },
  originCard: {
    marginBottom: spacing.stackLg,
  },
  thesaurusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackMd,
    marginBottom: spacing.stackLg,
  },
  thesaurusCard: {
    flex: 1,
    minWidth: 150,
  },
  thesaurusLabel: {
    fontFamily: 'Inter',
    fontSize: typography.labelCaps.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thesaurusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.default,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: typography.caption.fontSize,
  },
  originHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  originTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  originText: {
    fontFamily: 'Inter',
    lineHeight: 20,
    opacity: 0.9,
  },
  // Learning Notes
  notesSection: {
    marginTop: spacing.stackSm,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.stackSm,
  },
  notesTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 100,
    fontFamily: 'Inter',
    padding: 0,
  },
  notesActions: {
    alignItems: 'flex-end',
    marginTop: spacing.stackSm,
  },
  saveNoteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: rounded.default,
    shadowColor: '#0058be',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveNoteBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '500',
  },
});
