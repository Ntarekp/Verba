import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useAudio } from '../context/AudioContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestionsPanel } from '../components/SearchSuggestionsPanel';
import { WordCard } from '../components/WordCard';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { DictionaryStackParamList } from '../navigation/AppNavigator';
import { filterSuggestions } from '../data/suggestionBank';
import { rounded, spacing, typography } from '../styles/theme';
import { CollectionPicker, CollectionType } from '../components/CollectionPicker';

type Props = NativeStackScreenProps<DictionaryStackParamList, 'Discover'>;

const getRelativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { isGuest } = useAuth();
  const { savedWords, addSavedWord, removeSavedWord, streakCount } = useSaved();
  const { history, addHistoryWord } = useHistory();
  const {
    togglePlayPause: toggleWodAudio,
    prefetchAudio,
    isPlaying: isWodPlaying,
    isPaused: isWodPaused,
    isLoading: isWodAudioLoading,
  } = useAudio();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);

  const suggestions = useMemo(
    () => filterSuggestions(searchQuery),
    [searchQuery]
  );

  const showSuggestions = searchQuery.trim().length > 0 && suggestions.length > 0;

  // Hardcoded Word of the Day
  const wordOfDay = {
    word: 'Ethereal',
    phonetic: '/ɪˈθɪəriəl/',
    partOfSpeech: 'adjective',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/ethereal-us.mp3',
    definition: 'Extremely delicate and light in a way that seems not to be of this world.',
    example: 'Her ethereal beauty seemed to glow in the dim light of the church.'
  };

  useEffect(() => {
    prefetchAudio(wordOfDay.audioUrl);
  }, [prefetchAudio, wordOfDay.audioUrl]);

  const isWodSaved = savedWords.some(w => w.word.toLowerCase() === wordOfDay.word.toLowerCase());

  const handleSearchSubmit = (wordToSearch?: string) => {
    const targetWord = wordToSearch || searchQuery;
    if (!targetWord.trim()) {
      Alert.alert('Empty Search', 'Please enter a word to search.');
      return;
    }
    // Validate allowed characters
    const { isValidSearchQuery } = require('../utils/validation');
    if (!isValidSearchQuery(targetWord)) {
      Alert.alert('Invalid Search', 'Search queries may only contain letters, spaces and hyphens.');
      return;
    }
    setSearchQuery('');
    navigation.navigate('WordDetails', { word: targetWord.trim() });
  };

  const handleToggleSaveWod = () => {
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
    if (isWodSaved) {
      removeSavedWord(wordOfDay.word);
    } else {
      setCollectionPickerVisible(true);
    }
  };

  const handleCollectionSelectWod = (collection: CollectionType) => {
    addSavedWord(
      wordOfDay.word,
      wordOfDay.phonetic,
      wordOfDay.partOfSpeech,
      wordOfDay.definition,
      collection,
      wordOfDay.audioUrl,
      wordOfDay.example
    );
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
            placeholder="Search the dictionary..."
          />
          <SearchSuggestionsPanel
            query={searchQuery}
            suggestions={suggestions}
            visible={showSuggestions}
            onSelect={(word) => handleSearchSubmit(word)}
          />
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
          definition={wordOfDay.definition}
          example={wordOfDay.example}
          badgeLabel="WORD OF THE DAY"
          containerStyle={{ marginTop: 0 }}
        />

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
              <TouchableOpacity
                key={item.w}
                onPress={() => handleSearchSubmit(item.w)}
                activeOpacity={0.9}
              >
                <View
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
                      if (isGuest) {
                        Alert.alert(
                          'Sign In Required',
                          'Saving words is only available for registered users.',
                          [{ text: 'OK' }]
                        );
                        return;
                      }
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
              </TouchableOpacity>
            );
          })}
          </View>
        </View>

        {/* Bento Grid layout */}
        <View style={styles.bentoGrid}>
          {/* Learning Progress widget */}
          <View style={[styles.bentoCard, { backgroundColor: themeColors.surfaceContainerLowest }]}>
            <View style={styles.bentoCardText}>
              <Text style={[
                styles.bentoTitle, 
                { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
              ]}>
                {isGuest ? 'Sign in' : 'Progress'}
              </Text>
              <Text style={[
                styles.bentoSubtitle, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                {isGuest ? 'To track progress' : `Lvl ${Math.max(1, Math.floor(savedWords.length / 10))} • ${savedWords.length} saved`}
              </Text>
            </View>
            <View style={[styles.progressRing, { borderColor: isGuest ? themeColors.outlineVariant : themeColors.primary }]}>
              <Text style={[styles.progressText, { color: themeColors.onSurface }]}>{isGuest ? '—' : `${Math.min(100, Math.round((savedWords.length / 50) * 100))}%`}</Text>
            </View>
          </View>

          {/* Streak widget */}
          <View style={[styles.bentoCard, styles.streakCard, { backgroundColor: themeColors.surfaceContainerLow, borderLeftColor: themeColors.secondary }]}>
            <View style={styles.streakTextContainer}>
              <Text style={[
                styles.bentoTitle, 
                { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
              ]}>
                {isGuest ? 'Sign in' : 'Study Streak'}
              </Text>
              <Text style={[
                styles.bentoSubtitle, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                {isGuest ? 'To start streak' : 'Active streak count'}
              </Text>
              <Text style={[styles.streakNumber, { color: isGuest ? themeColors.outlineVariant : themeColors.secondary }]}>
                {isGuest ? '—' : streakCount} <Text style={{ fontSize: 14, fontWeight: '400' }}>days</Text>
              </Text>
            </View>
            <MaterialIcons name="local-fire-department" size={44} color={isGuest ? themeColors.outlineVariant : themeColors.tertiary} style={styles.streakIcon} />
          </View>
        </View>

        {history.length > 0 && !showSuggestions && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.recentLabel,
                  {
                    color: themeColors.outline,
                    fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                  },
                ]}
              >
                RECENT LOOKUPS
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={[styles.viewAll, { color: themeColors.primary, fontSize: 12 * fontSizeMultiplier }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentGrid}>
              {history.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSearchSubmit(item.word)}
                  activeOpacity={0.8}
                >
                  <GlassCard padding={12} borderRadius={rounded.lg}>
                    <View style={styles.recentRow}>
                      <View style={styles.recentLeft}>
                        <MaterialIcons name="history" size={18} color={themeColors.outlineVariant} />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.recentWord,
                              {
                                color: themeColors.onSurface,
                                fontSize: 14 * fontSizeMultiplier,
                              },
                            ]}
                          >
                            {item.word.charAt(0).toUpperCase() + item.word.slice(1)}
                          </Text>
                          <Text style={[styles.recentTime, { color: themeColors.outline, fontSize: 11 * fontSizeMultiplier }]}>
                            {getRelativeTime(item.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color={themeColors.outline} />
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <CollectionPicker
        visible={collectionPickerVisible}
        onClose={() => setCollectionPickerVisible(false)}
        onSelect={handleCollectionSelectWod}
        currentCollection="Favorites"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.gutter,
    paddingBottom: 48,
    flexGrow: 1,
    gap: spacing.stackLg,
  },
  searchSection: {
    position: 'relative',
    zIndex: 50,
  },
  recentLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.stackMd,
    paddingHorizontal: 4,
  },
  viewAll: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  recentGrid: {
    gap: spacing.stackSm,
    marginTop: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentWord: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  recentTime: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  bentoCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: rounded.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bentoCardText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
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
    minWidth: 0,
    paddingRight: 4,
  },
  streakNumber: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  streakIcon: {
    opacity: 0.9,
    marginLeft: 4,
    flexShrink: 0,
  },
  section: {
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
    borderRadius: rounded.xl,
    padding: 12,
    borderWidth: 0.5,
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
