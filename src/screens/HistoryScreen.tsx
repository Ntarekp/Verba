import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useHistory } from '../context/HistoryContext';
import { useTheme } from '../context/ThemeContext';
import { HistoryItem } from '../components/HistoryItem';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { groupHistoryByDate } from '../utils/dateHelper';
import { MainTabParamList } from '../navigation/AppNavigator';
import { navigateToWordDetails } from '../navigation/navigationHelpers';
import { spacing, typography } from '../styles/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'History'>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { history, deleteHistoryWord, clearHistory } = useHistory();
  const [filterQuery, setFilterQuery] = useState('');

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all search history records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearHistory() }
      ]
    );
  };

  const handleSelectItem = (word: string) => {
    navigateToWordDetails(navigation, word);
  };

  const filteredHistory = history.filter(item => 
    item.word.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const groupedData = groupHistoryByDate(filteredHistory);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header filter & Clear actions */}
      <View style={styles.topActions}>
        <View style={styles.titleRow}>
          <Text style={[
            styles.titleText, 
            { color: themeColors.onSurface, fontSize: typography.sectionHeading.fontSize * 0.8 * fontSizeMultiplier }
          ]}>
            Search History
          </Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
              <Text style={[styles.clearText, { color: themeColors.primary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <SearchBar
          value={filterQuery}
          onChangeText={setFilterQuery}
          onSubmit={() => {}}
          onClear={() => setFilterQuery('')}
          placeholder="Search your history..."
        />
      </View>

      {/* History List */}
      {history.length === 0 ? (
        <EmptyState
          title="A clean slate"
          description="Your search history is empty. Start exploring words to build your linguistic footprint."
          icon="auto-awesome"
        />
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          title="No history matches"
          description={`No history entries match the filter term "${filterQuery}".`}
          icon="search-off"
        />
      ) : (
        <SectionList
          sections={groupedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              onSelect={() => handleSelectItem(item.word)}
              onDelete={() => deleteHistoryWord(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[
              styles.sectionHeader, 
              { color: themeColors.onSurfaceVariant, fontSize: typography.labelCaps.fontSize * fontSizeMultiplier }
            ]}>
              {title.toUpperCase()}
            </Text>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActions: {
    padding: spacing.gutter,
    gap: spacing.stackSm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  clearText: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
});
