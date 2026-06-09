import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { SavedWordCard } from '../components/SavedWordCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SavedWordItem } from '../models/DictionaryTypes';
import { MainTabParamList } from '../navigation/AppNavigator';
import { navigateToWordDetails, navigateToAudioExperience } from '../navigation/navigationHelpers';
import { rounded, spacing, typography } from '../styles/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Saved'>;

type CollectionType = 'ALL' | 'Favorites' | 'Academic' | 'Travel';

interface QuizQuestion {
  word: string;
  correctAnswer: string;
  options: string[];
}

const COLLECTION_TABS: { id: CollectionType; label: string; showStar?: boolean }[] = [
  { id: 'ALL', label: 'ALL WORDS' },
  { id: 'Favorites', label: 'FAVORITES', showStar: true },
  { id: 'Academic', label: 'ACADEMIC' },
  { id: 'Travel', label: 'TRAVEL' },
];

const getRelativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

export const SavedWordsScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const stackStatsLayout = windowWidth < 380 || fontSizeMultiplier > 1.1;
  const {
    savedWords,
    removeSavedWord,
    updateWordMastery,
    streakCount,
    isLoading,
  } = useSaved();

  const [activeTab, setActiveTab] = useState<CollectionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const wordsMastered = useMemo(
    () => savedWords.filter((w) => w.masteryLevel >= 3).length,
    [savedWords]
  );

  const collectionCounts = useMemo(() => {
    const counts: Record<CollectionType, number> = {
      ALL: savedWords.length,
      Favorites: 0,
      Academic: 0,
      Travel: 0,
    };
    savedWords.forEach((item) => {
      counts[item.collection] += 1;
    });
    return counts;
  }, [savedWords]);

  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return savedWords.filter((item) => {
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.definitionSummary.toLowerCase().includes(query);
      if (activeTab === 'ALL') return matchesSearch;
      return matchesSearch && item.collection === activeTab;
    });
  }, [savedWords, searchQuery, activeTab]);

  const handleSelectItem = useCallback(
    (word: string) => {
      navigateToWordDetails(navigation, word);
    },
    [navigation]
  );

  const handleRemoveWord = useCallback(
    (word: string) => {
      removeSavedWord(word);
    },
    [removeSavedWord]
  );

  const handleStartQuiz = () => {
    if (savedWords.length < 4) {
      Alert.alert(
        'Vocabulary Quiz',
        'You need at least 4 saved words to generate a multiple-choice quiz. Save more words from the dictionary first!'
      );
      return;
    }

    const generatedQuestions: QuizQuestion[] = [];
    const pool = [...savedWords];
    const numQuestions = Math.min(5, pool.length);
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numQuestions; i++) {
      const target = shuffledPool[i];
      const correctAnswer = target.definitionSummary;
      const distractors = pool
        .filter((w) => w.word !== target.word)
        .map((w) => w.definitionSummary)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      generatedQuestions.push({
        word: target.word,
        correctAnswer,
        options,
      });
    }

    setQuizQuestions(generatedQuestions);
    setCurrentQuestionIdx(0);
    scoreRef.current = 0;
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizActive(true);
  };

  const handleAnswerSubmit = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const current = quizQuestions[currentQuestionIdx];
    const correct = option === current.correctAnswer;
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);

      const saved = savedWords.find(
        (w) => w.word.toLowerCase() === current.word.toLowerCase()
      );
      if (saved && saved.masteryLevel < 3) {
        const nextLevel = Math.min(3, saved.masteryLevel + 1) as 1 | 2 | 3;
        updateWordMastery(current.word, nextLevel);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      Alert.alert(
        'Quiz Finished!',
        `You scored ${scoreRef.current} out of ${quizQuestions.length} correct answers!`,
        [{ text: 'Close', onPress: () => setQuizActive(false) }]
      );
    }
  };

  const renderListHeader = () => (
    <View style={styles.headerBlock}>
      <Text
        style={[
          styles.subtitle,
          {
            color: themeColors.onSurfaceVariant,
            fontSize: typography.definitionBody.fontSize * 0.85 * fontSizeMultiplier,
            lineHeight: typography.definitionBody.lineHeight * 0.85 * fontSizeMultiplier,
          },
        ]}
      >
        Review and manage your vocabulary collection.
      </Text>

      <GlassCard padding={spacing.gutter} borderRadius={rounded.xl * 1.5} style={styles.statsCard}>
        <View style={[styles.statsRow, stackStatsLayout && styles.statsRowNarrow]}>
          <View style={[styles.statBlock, stackStatsLayout && styles.statBlockNarrow]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: themeColors.tertiaryContainer },
              ]}
            >
              <MaterialIcons
                name="local-fire-department"
                size={32}
                color={themeColors.onTertiaryContainer}
              />
            </View>
            <View style={styles.statTextCol}>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                    lineHeight: typography.caption.lineHeight * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={2}
              >
                Current Streak
              </Text>
              <View style={styles.statValueRow}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: themeColors.tertiary,
                      fontSize: 28 * fontSizeMultiplier,
                      lineHeight: 32 * fontSizeMultiplier,
                    },
                  ]}
                >
                  {streakCount}
                </Text>
                <Text
                  style={[
                    styles.statUnit,
                    {
                      color: themeColors.tertiaryFixedDim ?? themeColors.tertiary,
                      fontSize: 13 * fontSizeMultiplier,
                    },
                  ]}
                >
                  days
                </Text>
              </View>
            </View>
          </View>

          {!stackStatsLayout ? (
            <View
              style={[styles.statDivider, { backgroundColor: themeColors.outlineVariant + '40' }]}
            />
          ) : null}

          <View style={[styles.statBlock, stackStatsLayout && styles.statBlockNarrow]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: themeColors.primaryContainer },
              ]}
            >
              <MaterialIcons
                name="workspace-premium"
                size={32}
                color={themeColors.onPrimaryContainer}
              />
            </View>
            <View style={styles.statTextCol}>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                    lineHeight: typography.caption.lineHeight * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={2}
              >
                Words Mastered
              </Text>
              <View style={styles.statValueRow}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: themeColors.primary,
                      fontSize: 28 * fontSizeMultiplier,
                      lineHeight: 32 * fontSizeMultiplier,
                    },
                  ]}
                >
                  {wordsMastered}
                </Text>
                <Text
                  style={[
                    styles.statUnit,
                    {
                      color: themeColors.primaryFixedDim ?? themeColors.primary,
                      fontSize: 13 * fontSizeMultiplier,
                    },
                  ]}
                >
                  total
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStartQuiz}
          style={[
            styles.quizBtn,
            {
              borderColor: themeColors.outlineVariant,
              backgroundColor: themeColors.surfaceContainerLow,
            },
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="psychology" size={22} color={themeColors.onSurface} />
          <Text
            style={[
              styles.quizBtnText,
              {
                color: themeColors.onSurface,
                fontSize: typography.buttonText.fontSize * 0.9 * fontSizeMultiplier,
              },
            ]}
          >
            Start Quiz
          </Text>
        </TouchableOpacity>
      </GlassCard>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => {}}
          onClear={() => setSearchQuery('')}
          placeholder="Search saved words..."
        />
      </View>

      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrap}>
          {COLLECTION_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = collectionCounts[tab.id];
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isActive
                      ? themeColors.secondaryContainer
                      : 'transparent',
                    borderColor: isActive
                      ? 'transparent'
                      : themeColors.outlineVariant,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    {
                      color: isActive
                        ? themeColors.onSecondaryContainer
                        : themeColors.onSurfaceVariant,
                      fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
                      lineHeight: typography.labelCaps.lineHeight * fontSizeMultiplier,
                    },
                  ]}
                >
                  {tab.label}
                  {tab.showStar ? ' ★' : ''}
                  {!isActive && count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderSavedItem = ({ item }: { item: SavedWordItem }) => (
    <SavedWordCard
      item={item}
      relativeTime={getRelativeTime(item.timestamp)}
      onPress={() => handleSelectItem(item.word)}
      onRemove={() => handleRemoveWord(item.word)}
      onOpenAudioExperience={(word) => navigateToAudioExperience(navigation, word)}
    />
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingWrap,
          { backgroundColor: themeColors.background },
        ]}
      >
        <LoadingSpinner message="Loading your collection..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Modal
        visible={quizActive}
        animationType="slide"
        onRequestClose={() => setQuizActive(false)}
      >
        <View
          style={[
            styles.quizContainer,
            {
              backgroundColor: themeColors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View
            style={[
              styles.quizHeader,
              { borderBottomColor: themeColors.outlineVariant + '40' },
            ]}
          >
            <Text
              style={[
                styles.quizHeaderTitle,
                {
                  color: themeColors.primary,
                  fontSize: typography.sectionHeading.fontSize * 0.9 * fontSizeMultiplier,
                  lineHeight: typography.sectionHeading.lineHeight * 0.9 * fontSizeMultiplier,
                },
              ]}
              numberOfLines={1}
            >
              Vocabulary Quiz
            </Text>
            <TouchableOpacity
              onPress={() => setQuizActive(false)}
              style={styles.closeBtn}
              accessibilityLabel="Close quiz"
            >
              <MaterialIcons name="close" size={24} color={themeColors.onSurface} />
            </TouchableOpacity>
          </View>

          {quizQuestions.length > 0 && (
            <ScrollView
              style={styles.quizBodyScroll}
              contentContainerStyle={styles.quizBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.progressText,
                  {
                    color: themeColors.outline,
                    fontSize: typography.caption.fontSize * 0.85 * fontSizeMultiplier,
                    lineHeight: typography.caption.lineHeight * 0.85 * fontSizeMultiplier,
                  },
                ]}
              >
                QUESTION {currentQuestionIdx + 1} OF {quizQuestions.length}
              </Text>

              <View style={styles.questionWordWrap}>
                <Text
                  style={[
                    styles.questionWord,
                    {
                      color: themeColors.onSurface,
                      fontSize: 32 * fontSizeMultiplier,
                    },
                  ]}
                  adjustsFontSizeToFit
                  numberOfLines={3}
                  minimumFontScale={0.75}
                >
                  "{quizQuestions[currentQuestionIdx].word}"
                </Text>
              </View>

              <Text
                style={[
                  styles.questionSubtitle,
                  {
                    color: themeColors.onSurfaceVariant,
                    fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                    lineHeight: typography.buttonText.lineHeight * fontSizeMultiplier,
                  },
                ]}
              >
                Choose the correct definition for this word:
              </Text>

              <View style={styles.optionsContainer}>
                {quizQuestions[currentQuestionIdx].options.map((option) => {
                  let optionBg = themeColors.surfaceContainerLowest;
                  let optionBorder = themeColors.outlineVariant + '40';

                  if (isAnswered) {
                    const isCorrectOption =
                      option === quizQuestions[currentQuestionIdx].correctAnswer;
                    const isSelected = option === selectedOption;

                    if (isCorrectOption) {
                      optionBg = '#dcfce7';
                      optionBorder = '#16a34a';
                    } else if (isSelected) {
                      optionBg = '#fee2e2';
                      optionBorder = '#dc2626';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => handleAnswerSubmit(option)}
                      disabled={isAnswered}
                      style={[
                        styles.optionCard,
                        { backgroundColor: optionBg, borderColor: optionBorder },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: themeColors.onSurface,
                            fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                            lineHeight: typography.buttonText.lineHeight * fontSizeMultiplier,
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isAnswered && (
                <TouchableOpacity
                  onPress={handleNextQuestion}
                  style={[styles.nextBtn, { backgroundColor: themeColors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.nextBtnText,
                      {
                        fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                        lineHeight: typography.buttonText.lineHeight * fontSizeMultiplier,
                      },
                    ]}
                  >
                    {currentQuestionIdx === quizQuestions.length - 1
                      ? 'Show Score'
                      : 'Next Question'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}

              <Text
                style={[
                  styles.scoreHint,
                  {
                    color: themeColors.outline,
                    fontSize: typography.caption.fontSize * fontSizeMultiplier,
                    lineHeight: typography.caption.lineHeight * fontSizeMultiplier,
                  },
                ]}
              >
                Score: {score} / {quizQuestions.length}
              </Text>
            </ScrollView>
          )}
        </View>
      </Modal>

      <FlatList
        data={filteredWords}
        renderItem={renderSavedItem}
        keyExtractor={(item) => item.word}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <EmptyState
            compact
            title="Empty Collection"
            description={
              searchQuery
                ? `No bookmarked words match "${searchQuery}".`
                : activeTab === 'ALL'
                  ? 'Words you bookmark from the dictionary will appear here.'
                  : `Your "${activeTab}" collection is currently empty.`
            }
            icon="bookmark-border"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.stackSm,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: spacing.stackSm,
  },
  subtitle: {
    fontFamily: 'Inter',
    marginBottom: spacing.stackMd,
  },
  loadingWrap: {
    paddingHorizontal: spacing.containerPadding,
    justifyContent: 'center',
  },
  statsCard: {
    marginBottom: spacing.stackLg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.stackMd,
    gap: spacing.stackSm,
  },
  statsRowNarrow: {
    flexWrap: 'wrap',
  },
  statBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  statBlockNarrow: {
    flexBasis: '100%',
  },
  statTextCol: {
    flex: 1,
    minWidth: 0,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: rounded.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  statUnit: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    minHeight: 48,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: rounded.xl,
    borderWidth: 1,
  },
  quizBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: spacing.stackMd,
  },
  tabsContainer: {
    marginBottom: spacing.stackMd,
  },
  tabsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
    width: '100%',
  },
  tabBtn: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  tabBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  quizHeaderTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
    marginRight: spacing.stackSm,
  },
  closeBtn: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizBodyScroll: {
    flex: 1,
  },
  quizBodyContent: {
    flexGrow: 1,
    padding: spacing.containerPadding,
    paddingBottom: spacing.stackLg,
  },
  questionWordWrap: {
    width: '100%',
    paddingHorizontal: spacing.gutter,
    marginBottom: 6,
  },
  progressText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionWord: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  questionSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
    flexShrink: 1,
    width: '100%',
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: rounded.lg,
    padding: 16,
    width: '100%',
  },
  optionText: {
    fontFamily: 'Inter',
    flexShrink: 1,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: rounded.xl,
    marginBottom: 12,
  },
  nextBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
  },
  scoreHint: {
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
