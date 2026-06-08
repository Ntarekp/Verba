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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { lookupWord } from '../services/dictionaryService';
import { DictionaryEntry, Phonetic } from '../models/DictionaryTypes';
import { WordCard } from '../components/WordCard';
import { MeaningCard } from '../components/MeaningCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { useAudio } from '../hooks/useAudio';
import { getAutoplayEnabled } from '../utils/settingsHelper';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetails'>;

// Derive a human-readable accent label from the audio URL
const getAccentLabel = (phonetic: Phonetic): string => {
  const url = phonetic.audio?.toLowerCase() || '';
  if (url.includes('-us') || url.includes('_us') || url.includes('/en-us')) return '🇺🇸 American';
  if (url.includes('-uk') || url.includes('_uk') || url.includes('/en-gb')) return '🇬🇧 British';
  if (url.includes('-au') || url.includes('_au')) return '🇦🇺 Australian';
  return phonetic.text ? phonetic.text : '🔊 Standard';
};

export const WordDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { word: initialWord } = route.params;
  const [word, setWord] = useState(initialWord);

  const { themeColors, fontSizeMultiplier } = useTheme();
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
  const [errorType, setErrorType] = useState<'404' | 'offline' | 'server' | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [noteText, setNoteText] = useState('');

  // Activity 3, Req 5: track all available audio phonetics + which one is selected
  const [availablePhonetics, setAvailablePhonetics] = useState<Phonetic[]>([]);
  const [selectedPhoneticIndex, setSelectedPhoneticIndex] = useState<number>(0);

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
      const validPhonetics = data.phonetics.filter(
        p => p.audio && p.audio.trim().length > 0
      );
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
      if (e.message === 'WORD_NOT_FOUND') {
        setErrorType('404');
      } else if (e.message === 'NETWORK_TIMEOUT') {
        setErrorType('offline');
      } else if (e.message === 'EMPTY_RESPONSE' || e.message === 'EMPTY_QUERY') {
        setErrorType('server');
      } else {
        setErrorType('server');
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
    stopAudio();
    fetchDetails(word);
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
      const primaryMeaning = entry.meanings[0];
      const partOfSpeech = primaryMeaning?.partOfSpeech || 'noun';
      const summary = primaryMeaning?.definitions[0]?.definition || '';
      addSavedWord(entry.word, entry.phonetic, partOfSpeech, summary, 'Favorites');
    }
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
    setWord(newWord);
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
        onRetry={() => fetchDetails(word)}
        onBack={() => navigation.goBack()}
        onNavigateToSaved={
          errorType === 'offline'
            ? () => {
                navigation.goBack();
                navigation.getParent()?.navigate('MainDrawer', { screen: 'SavedWords' });
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Custom Header Nav */}
        <View style={styles.header}>
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

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Word Header Card */}
          <WordCard
            word={entry.word}
            phonetic={entry.phonetic}
            partOfSpeech={entry.meanings[0]?.partOfSpeech || 'noun'}
            audioUrl={activeAudioUrl}
            isSaved={isSaved}
            onPlay={handlePlayAudio}
            onToggleSave={handleToggleSave}
            savedCollection={savedItem?.collection}
            isAudioPlaying={isAudioPlaying && isCurrentlySelected}
            isAudioPaused={isAudioPaused && isCurrentlySelected}
            isAudioLoading={isAudioLoading && isCurrentlySelected}
          />

          {/* Activity 3, Req 5: Accent Selector — shown only when multiple pronunciations exist */}
          {availablePhonetics.length > 1 && (
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
                      accessibilityLabel={`Select ${accentLabel} pronunciation`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        style={[
                          styles.accentChipText,
                          {
                            color: isSelected
                              ? themeColors.onSecondaryContainer
                              : themeColors.onSurfaceVariant,
                            fontWeight: isSelected ? '600' : '500',
                            fontSize: typography.caption.fontSize * fontSizeMultiplier,
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
          )}

          {/* Word Origin Card (Etymology) */}
          {entry.origin ? (
            <View
              style={[
                styles.originCard,
                {
                  backgroundColor: themeColors.surfaceContainerLowest,
                  borderColor: themeColors.outlineVariant + '30',
                },
              ]}
            >
              <View style={styles.originHeader}>
                <MaterialIcons name="history-edu" size={20} color={themeColors.secondary} />
                <Text
                  style={[
                    styles.originTitle,
                    {
                      color: themeColors.secondary,
                      fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
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
            </View>
          ) : null}

          {/* Meanings — all parts of speech with definitions (Activity 2) */}
          {entry.meanings.map((meaning, idx) => (
            <MeaningCard
              key={idx}
              meaning={meaning}
              onSelectWord={handleSelectRelatedWord}
            />
          ))}

          {/* Learning Notes Section */}
          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <MaterialIcons name="edit-note" size={24} color={themeColors.primary} />
              <Text
                style={[
                  styles.notesTitle,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                Learning Notes
              </Text>
            </View>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: themeColors.surfaceContainerLowest,
                  borderColor: themeColors.outlineVariant + '50',
                  color: themeColors.onSurface,
                  fontSize: 16 * fontSizeMultiplier,
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
            <View style={styles.notesActions}>
              <TouchableOpacity
                onPress={handleSaveNotes}
                style={[styles.saveNoteBtn, { backgroundColor: themeColors.secondary }]}
                activeOpacity={0.8}
                accessibilityLabel="Save learning notes"
                accessibilityRole="button"
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: Platform.OS === 'android' ? 24 : 0,
  },
  navBtn: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
  },
  scrollContent: {
    padding: spacing.gutter,
    paddingBottom: 40,
  },
  // Activity 3 Req 5 — Accent selector
  accentSection: {
    marginBottom: spacing.stackLg,
    marginTop: -spacing.stackMd,
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
  // Word Origin
  originCard: {
    borderRadius: rounded.xl,
    padding: spacing.gutter,
    borderWidth: 1,
    marginBottom: spacing.stackLg,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
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
    borderWidth: 1,
    borderRadius: rounded.lg,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
    fontFamily: 'Inter',
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
