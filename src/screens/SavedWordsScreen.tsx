import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { DrawerParamList } from '../navigation/AppNavigator';
import { rounded, spacing, typography } from '../styles/theme';

type Props = DrawerScreenProps<DrawerParamList, 'SavedWords'>;

type CollectionType = 'ALL' | 'Favorites' | 'Academic' | 'Travel';

interface QuizQuestion {
  word: string;
  correctAnswer: string;
  options: string[];
}

export const SavedWordsScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { savedWords, removeSavedWord, streakCount } = useSaved();

  const [activeTab, setActiveTab] = useState<CollectionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const tabs: CollectionType[] = ['ALL', 'Favorites', 'Academic', 'Travel'];

  const filteredWords = savedWords.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'ALL') return matchesSearch;
    return matchesSearch && item.collection === activeTab;
  });

  const handleSelectItem = (word: string) => {
    navigation.getParent()?.navigate('WordDetails', { word });
  };

  const handleStartQuiz = () => {
    if (savedWords.length < 4) {
      Alert.alert(
        'Vocabulary Quiz',
        'You need at least 4 saved words to generate a multiple-choice quiz. Go back and lookup more words!'
      );
      return;
    }

    // Generate questions
    const generatedQuestions: QuizQuestion[] = [];
    const pool = [...savedWords];
    
    // Determine number of questions (up to 5)
    const numQuestions = Math.min(5, pool.length);

    // Shuffle pool
    const shuffledPool = pool.sort(() => 0.5 - Math.random());

    for (let i = 0; i < numQuestions; i++) {
      const target = shuffledPool[i];
      const correctAnswer = target.definitionSummary;
      
      // Get distractors from other words in pool
      const distractors = pool
        .filter(w => w.word !== target.word)
        .map(w => w.definitionSummary)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Combine options and shuffle
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      generatedQuestions.push({
        word: target.word,
        correctAnswer,
        options
      });
    }

    setQuizQuestions(generatedQuestions);
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizActive(true);
  };

  const handleAnswerSubmit = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === quizQuestions[currentQuestionIdx].correctAnswer;
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz ended
      Alert.alert(
        'Quiz Finished!',
        `You scored ${score} out of ${quizQuestions.length} correct answers!`,
        [{ text: 'Close', onPress: () => setQuizActive(false) }]
      );
    }
  };

  const renderSavedItem = ({ item }: { item: typeof savedWords[0] }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSelectItem(item.word)}
        style={[styles.wordCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '40' }]}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.wordHeaderLeft}>
            <Text style={[styles.wordName, { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
              {item.word}
            </Text>
            <View style={[styles.badge, { borderColor: themeColors.primary + '30', backgroundColor: themeColors.primary + '0A' }]}>
              <Text style={[styles.badgeText, { color: themeColors.primary, fontSize: 10 }]}>
                {item.partOfSpeech.substring(0, 3)}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity onPress={() => removeSavedWord(item.word)} style={styles.bookmarkBtn}>
              <MaterialIcons name="star" size={22} color="#d97706" />
            </TouchableOpacity>
          </View>
        </View>

        <Text 
          style={[styles.definitionSummary, { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }]}
          numberOfLines={2}
        >
          {item.definitionSummary}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.dateText, { color: themeColors.outline }]}>
            Saved in {item.collection}
          </Text>
          {/* Mastery Indicator dots */}
          <View style={styles.masteryDots}>
            {[1, 2, 3].map((dot) => (
              <View 
                key={dot} 
                style={[
                  styles.masteryDot, 
                  { 
                    backgroundColor: dot <= item.masteryLevel 
                      ? themeColors.secondary 
                      : themeColors.outlineVariant 
                  }
                ]} 
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Quiz Modal */}
      <Modal
        visible={quizActive}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setQuizActive(false)}
      >
        <SafeAreaView style={[styles.quizContainer, { backgroundColor: themeColors.background }]}>
          <View style={styles.quizHeader}>
            <Text style={[styles.quizHeaderTitle, { color: themeColors.primary }]}>Vocabulary Quiz</Text>
            <TouchableOpacity onPress={() => setQuizActive(false)} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={themeColors.onSurface} />
            </TouchableOpacity>
          </View>

          {quizQuestions.length > 0 && (
            <View style={styles.quizBody}>
              {/* Question progress */}
              <Text style={[styles.progressIndicatorText, { color: themeColors.outline }]}>
                QUESTION {currentQuestionIdx + 1} OF {quizQuestions.length}
              </Text>

              {/* Question Word */}
              <Text style={[styles.questionWord, { color: themeColors.onSurface, fontSize: 32 * fontSizeMultiplier }]}>
                "{quizQuestions[currentQuestionIdx].word}"
              </Text>
              
              <Text style={[styles.questionSubtitle, { color: themeColors.onSurfaceVariant }]}>
                Choose the correct definition for this word:
              </Text>

              {/* Options list */}
              <View style={styles.optionsContainer}>
                {quizQuestions[currentQuestionIdx].options.map((option) => {
                  let optionBg = themeColors.surfaceContainerLowest;
                  let optionBorder = themeColors.outlineVariant + '40';
                  
                  if (isAnswered) {
                    const isCorrectOption = option === quizQuestions[currentQuestionIdx].correctAnswer;
                    const isSelected = option === selectedOption;
                    
                    if (isCorrectOption) {
                      optionBg = '#dcfce7'; // green background
                      optionBorder = '#16a34a';
                    } else if (isSelected) {
                      optionBg = '#fee2e2'; // red background
                      optionBorder = '#dc2626';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => handleAnswerSubmit(option)}
                      disabled={isAnswered}
                      style={[styles.optionCard, { backgroundColor: optionBg, borderColor: optionBorder }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, { color: themeColors.onSurface }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action buttons */}
              {isAnswered && (
                <TouchableOpacity
                  onPress={handleNextQuestion}
                  style={[styles.nextQuestionBtn, { backgroundColor: themeColors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextQuestionBtnText}>
                    {currentQuestionIdx === quizQuestions.length - 1 ? 'Show Score' : 'Next Question'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Main Canvas ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Streak and stats bento */}
        <View style={[styles.streakBento, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '40' }]}>
          <View style={styles.streakLeft}>
            <View style={[styles.fireCircle, { backgroundColor: themeColors.tertiaryContainer + '20' }]}>
              <MaterialIcons name="local-fire-department" size={28} color={themeColors.tertiary} />
            </View>
            <View>
              <Text style={[styles.streakLabel, { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }]}>
                Current Streak
              </Text>
              <Text style={[styles.streakCount, { color: themeColors.tertiary }]}>
                {streakCount} <Text style={{ fontSize: 14, fontWeight: '400' }}>days</Text>
              </Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakRight}>
            <TouchableOpacity 
              onPress={handleStartQuiz}
              style={[styles.quizBtn, { backgroundColor: themeColors.secondary }]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="psychology" size={20} color="#fff" />
              <Text style={styles.quizBtnText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search list filtering */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={() => {}}
            onClear={() => setSearchQuery('')}
            placeholder="Search saved words..."
          />
        </View>

        {/* Tabs collections grid */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabBtn,
                  { 
                    backgroundColor: activeTab === tab ? themeColors.secondaryContainer : 'transparent',
                    borderColor: activeTab === tab ? 'transparent' : themeColors.outlineVariant 
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabBtnText,
                  { 
                    color: activeTab === tab ? themeColors.onSecondaryContainer : themeColors.onSurfaceVariant,
                    fontWeight: activeTab === tab ? '600' : '500',
                    fontSize: typography.labelCaps.fontSize * fontSizeMultiplier
                  }
                ]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Words cards grid */}
        {filteredWords.length === 0 ? (
          <EmptyState
            title="Empty Collection"
            description={searchQuery ? `No bookmarked words match "${searchQuery}".` : `Your "${activeTab}" collection is currently empty.`}
            icon="star-border"
          />
        ) : (
          <FlatList
            data={filteredWords}
            renderItem={renderSavedItem}
            keyExtractor={(item) => item.word}
            scrollEnabled={false} // Nested inside ScrollView
            contentContainerStyle={styles.wordsGrid}
          />
        )}
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
  streakBento: {
    flexDirection: 'row',
    borderRadius: rounded.xl,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.stackLg,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  streakLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  streakCount: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(119, 117, 135, 0.2)',
    marginHorizontal: 12,
  },
  streakRight: {
    justifyContent: 'center',
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: rounded.lg,
    shadowColor: '#0058be',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  quizBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  searchSection: {
    marginBottom: spacing.stackMd,
  },
  tabsContainer: {
    marginBottom: spacing.stackLg,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabBtn: {
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabBtnText: {
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  wordsGrid: {
    gap: 12,
  },
  wordCard: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordName: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkBtn: {
    padding: 4,
  },
  definitionSummary: {
    fontFamily: 'Inter',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  masteryDots: {
    flexDirection: 'row',
    gap: 4,
  },
  masteryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Quiz styling
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(119, 117, 135, 0.2)',
  },
  quizHeaderTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
  },
  closeBtn: {
    padding: 4,
  },
  quizBody: {
    flex: 1,
    padding: spacing.containerPadding,
    justifyContent: 'center',
  },
  progressIndicatorText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionWord: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
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
    marginBottom: 32,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: rounded.lg,
    padding: 16,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  optionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 22,
  },
  nextQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: rounded.xl,
  },
  nextQuestionBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
