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
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { lookupWord } from '../services/dictionaryService';
import { DictionaryEntry } from '../models/DictionaryTypes';
import { WordCard } from '../components/WordCard';
import { MeaningCard } from '../components/MeaningCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { useAudio } from '../hooks/useAudio';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetails'>;

export const WordDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { word: initialWord } = route.params;
  const [word, setWord] = useState(initialWord);

  const { themeColors, fontSizeMultiplier } = useTheme();
  const { savedWords, addSavedWord, removeSavedWord, updateWordNotes } = useSaved();
  const { addHistoryWord } = useHistory();
  const { playAudio, isLoading: isAudioPlaying } = useAudio();

  const [loading, setLoading] = useState<boolean>(true);
  const [errorType, setErrorType] = useState<'404' | 'offline' | 'server' | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [noteText, setNoteText] = useState('');

  const savedItem = savedWords.find(w => w.word.toLowerCase() === word.toLowerCase());
  const isSaved = !!savedItem;

  const fetchDetails = async (searchWord: string) => {
    try {
      setLoading(true);
      setErrorType(null);
      const data = await lookupWord(searchWord);
      setEntry(data);
      
      // Load saved notes if present
      const match = savedWords.find(w => w.word.toLowerCase() === searchWord.toLowerCase());
      setNoteText(match?.learningNotes || '');

      // Log search history
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
      } else {
        setErrorType('server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(word);
  }, [word]);

  const handlePlayAudio = () => {
    if (!entry) return;
    const audioPhonetic = entry.phonetics.find(p => p.audio && p.audio.endsWith('.mp3'));
    if (audioPhonetic) {
      playAudio(audioPhonetic.audio);
    } else {
      Alert.alert('Pronunciation Unavailable', 'No voice recordings found for this entry.');
    }
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
      // Prompt user to save the word first
      Alert.alert('Save Word First', 'Please bookmark this word to save notes associated with it.');
      return;
    }
    updateWordNotes(entry.word, noteText);
    Alert.alert('Notes Saved', `Mnemonic notes saved for "${entry.word}".`);
  };

  const handleSelectRelatedWord = (newWord: string) => {
    // Tapping synonym/antonym triggers deep lookup reload
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
      />
    );
  }

  if (!entry) return null;

  const audioUrl = entry.phonetics.find(p => p.audio && p.audio.endsWith('.mp3'))?.audio || null;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Custom Header Nav */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <MaterialIcons name="arrow-back" size={24} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Verba</Text>
          <TouchableOpacity style={styles.navBtn}>
            <MaterialIcons name="more-vert" size={24} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Word Header Card */}
          <WordCard
            word={entry.word}
            phonetic={entry.phonetic}
            partOfSpeech={entry.meanings[0]?.partOfSpeech || 'noun'}
            audioUrl={audioUrl}
            isSaved={isSaved}
            onPlay={handlePlayAudio}
            onToggleSave={handleToggleSave}
            savedCollection={savedItem?.collection}
          />

          {/* Word Origin Card (Etymology) */}
          {entry.origin ? (
            <View style={[
              styles.originCard, 
              { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }
            ]}>
              <View style={styles.originHeader}>
                <MaterialIcons name="history-edu" size={20} color={themeColors.secondary} />
                <Text style={[
                  styles.originTitle, 
                  { color: themeColors.secondary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
                ]}>
                  Word Origin
                </Text>
              </View>
              <Text style={[
                styles.originText, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                {entry.origin}
              </Text>
            </View>
          ) : null}

          {/* Senses Meanings List */}
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
              <Text style={[
                styles.notesTitle, 
                { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
              ]}>
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
                  fontSize: 16 * fontSizeMultiplier 
                }
              ]}
              multiline
              numberOfLines={4}
              placeholder="Add your personal notes or mnemonic devices here..."
              placeholderTextColor={`${themeColors.outline}A0`}
              value={noteText}
              onChangeText={setNoteText}
            />
            <View style={styles.notesActions}>
              <TouchableOpacity
                onPress={handleSaveNotes}
                style={[styles.saveNoteBtn, { backgroundColor: themeColors.secondary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.saveNoteBtnText, { fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
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
