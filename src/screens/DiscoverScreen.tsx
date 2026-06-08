import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { useAudio } from '../hooks/useAudio';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { WordCard } from '../components/WordCard';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { DrawerParamList } from '../navigation/AppNavigator';
import { rounded, spacing, typography } from '../styles/theme';
import { useDebounce } from '../hooks/useDebounce';

type Props = DrawerScreenProps<DrawerParamList, 'Discover'>;

// Preset list for live search suggestions overlay
const SUGGESTIONS_BANK = [
  'ephemeral', 'ethereal', 'ubiquitous', 'mellifluous', 
  'enigma', 'resilience', 'empathy', 'paradigm', 'sycophant',
  'solitude', 'serendipity', 'eloquent', 'audacious'
];

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { savedWords, addSavedWord, removeSavedWord, streakCount } = useSaved();
  const { history, addHistoryWord } = useHistory();
  const {
    togglePlayPause: toggleWodAudio,
    isPlaying: isWodPlaying,
    isPaused: isWodPaused,
    isLoading: isWodAudioLoading,
  } = useAudio();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 200);

  // Hardcoded Word of the Day
  const wordOfDay = {
    word: 'Ethereal',
    phonetic: '/ɪˈθɪəriəl/',
    partOfSpeech: 'adjective',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/ethereal-us.mp3',
    definition: 'Extremely delicate and light in a way that seems not to be of this world.',
    example: 'Her ethereal beauty seemed to glow in the dim light of the church.'
  };

  const isWodSaved = savedWords.some(w => w.word.toLowerCase() === wordOfDay.word.toLowerCase());

  // Handle live suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const filtered = SUGGESTIONS_BANK.filter(word => 
        word.toLowerCase().startsWith(debouncedQuery.trim().toLowerCase()) &&
        word.toLowerCase() !== debouncedQuery.trim().toLowerCase()
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = (wordToSearch?: string) => {
    const targetWord = wordToSearch || searchQuery;
    if (!targetWord.trim()) {
      Alert.alert('Empty Search', 'Please enter a word to search.');
      return;
    }
    setSearchQuery('');
    setSuggestions([]);
    // Navigate using the parent Stack navigator
    navigation.getParent()?.navigate('WordDetails', { word: targetWord.trim() });
  };

  const handleToggleSaveWod = () => {
    if (isWodSaved) {
      removeSavedWord(wordOfDay.word);
    } else {
      addSavedWord(
        wordOfDay.word,
        wordOfDay.phonetic,
        wordOfDay.partOfSpeech,
        wordOfDay.definition,
        'Favorites'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Search Bar section */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={() => handleSearchSubmit()}
            onClear={() => setSearchQuery('')}
            placeholder="Search millions of words"
          />

          {/* Suggestions Dropdown panel */}
          {suggestions.length > 0 && (
            <View style={[
              styles.suggestionsPanel, 
              { 
                backgroundColor: themeColors.surfaceContainerLowest, 
                borderColor: themeColors.outlineVariant + '60' 
              }
            ]}>
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.suggestionRow,
                    { borderBottomColor: idx < suggestions.length - 1 ? themeColors.outlineVariant + '20' : 'transparent' }
                  ]}
                  onPress={() => handleSearchSubmit(item)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="search" size={18} color={themeColors.outline} />
                  <Text style={[styles.suggestionText, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>
                    {item}
                  </Text>
                  <MaterialIcons name="north-west" size={16} color={themeColors.outline} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Word of the Day Hero card */}
        <WordCard
          word={wordOfDay.word}
          phonetic={wordOfDay.phonetic}
          partOfSpeech={wordOfDay.partOfSpeech}
          audioUrl={wordOfDay.audioUrl}
          isSaved={isWodSaved}
          onPlay={() => toggleWodAudio(wordOfDay.audioUrl)}
          onToggleSave={handleToggleSaveWod}
          isAudioPlaying={isWodPlaying}
          isAudioPaused={isWodPaused}
          isAudioLoading={isWodAudioLoading}
        />

        {/* Bento Grid layout */}
        <View style={styles.bentoGrid}>
          {/* Learning Progress widget */}
          <View style={[styles.bentoCard, { backgroundColor: themeColors.surfaceContainerLowest }]}>
            <View style={styles.bentoCardText}>
              <Text style={[
                styles.bentoTitle, 
                { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
              ]}>
                Progress
              </Text>
              <Text style={[
                styles.bentoSubtitle, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                Lvl 12 • {savedWords.length} saved
              </Text>
            </View>
            <View style={[styles.progressRing, { borderColor: themeColors.primary }]}>
              <Text style={[styles.progressText, { color: themeColors.onSurface }]}>75%</Text>
            </View>
          </View>

          {/* Streak widget */}
          <View style={[styles.bentoCard, styles.streakCard, { backgroundColor: themeColors.surfaceContainerLow, borderLeftColor: themeColors.secondary }]}>
            <View style={styles.streakTextContainer}>
              <Text style={[
                styles.bentoTitle, 
                { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
              ]}>
                Study Streak
              </Text>
              <Text style={[
                styles.bentoSubtitle, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                Active streak count
              </Text>
              <Text style={[styles.streakNumber, { color: themeColors.secondary }]}>
                {streakCount} <Text style={{ fontSize: 14, fontWeight: '400' }}>days</Text>
              </Text>
            </View>
            <MaterialIcons name="local-fire-department" size={44} color={themeColors.tertiary} style={styles.streakIcon} />
          </View>
        </View>

        {/* Recent searches row */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionHeader, 
              { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
            ]}>
              Recent Searches
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
              {history.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSearchSubmit(item.word)}
                  style={[styles.chip, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '60' }]}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="history" size={14} color={themeColors.outline} />
                  <Text style={[styles.chipText, { color: themeColors.onSurface, fontSize: typography.caption.fontSize * fontSizeMultiplier }]}>
                    {item.word}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Words list */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionHeader, 
            { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
          ]}>
            Trending Words
          </Text>
          <View style={styles.trendingList}>
            {[
              { w: 'Resilience', desc: 'The capacity to recover quickly from difficulties; toughness.' },
              { w: 'Empathy', desc: 'The ability to understand and share the feelings of another.' },
              { w: 'Paradigm', desc: 'A typical example or pattern of something; a model.' }
            ].map((item) => {
              const isTrendingSaved = savedWords.some(w => w.word.toLowerCase() === item.w.toLowerCase());
              return (
                <View 
                  key={item.w} 
                  style={[styles.trendingRow, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }]}
                >
                  <View style={styles.trendingText}>
                    <View style={styles.trendingWordHeader}>
                      <Text style={[styles.trendingWord, { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
                        {item.w}
                      </Text>
                      <MaterialIcons name="trending-up" size={14} color={themeColors.error} />
                    </View>
                    <Text 
                      style={[styles.trendingDesc, { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }]}
                      numberOfLines={1}
                    >
                      {item.desc}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (isTrendingSaved) {
                        removeSavedWord(item.w);
                      } else {
                        addSavedWord(item.w, '', 'noun', item.desc, 'Favorites');
                      }
                    }}
                    style={styles.trendingSave}
                  >
                    <MaterialIcons 
                      name={isTrendingSaved ? "star" : "star-border"} 
                      size={22} 
                      color={isTrendingSaved ? '#d97706' : themeColors.outline} 
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.gutter,
    paddingBottom: 40,
  },
  searchSection: {
    position: 'relative',
    zIndex: 10,
    marginBottom: spacing.stackLg,
  },
  suggestionsPanel: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: rounded.lg,
    borderWidth: 1,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    zIndex: 999,
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginLeft: 12,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.gutter,
    marginBottom: spacing.stackLg,
  },
  bentoCard: {
    flex: 1,
    borderRadius: rounded.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bentoCardText: {
    flex: 1,
  },
  bentoTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontFamily: 'Inter',
    opacity: 0.8,
  },
  progressRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  streakCard: {
    borderLeftWidth: 4,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakNumber: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  streakIcon: {
    opacity: 0.9,
    marginLeft: 8,
  },
  section: {
    marginBottom: spacing.stackLg,
  },
  sectionHeader: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: spacing.stackSm,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  trendingList: {
    gap: 8,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rounded.lg,
    padding: 12,
    borderWidth: 1,
  },
  trendingText: {
    flex: 1,
  },
  trendingWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trendingWord: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  trendingDesc: {
    fontFamily: 'Inter',
    opacity: 0.8,
  },
  trendingSave: {
    padding: 8,
  },
});
