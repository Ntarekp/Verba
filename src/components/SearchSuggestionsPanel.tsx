import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

export interface SuggestionItem {
  word: string;
  partOfSpeech: string;
}

interface SearchSuggestionsPanelProps {
  query: string;
  suggestions: SuggestionItem[];
  onSelect: (word: string) => void;
  visible: boolean;
}

const formatPosLabel = (pos: string) => {
  const lower = pos.toLowerCase();
  if (lower.startsWith('adj')) return 'Adj';
  if (lower.startsWith('noun') || lower === 'noun') return 'Noun';
  if (lower.startsWith('verb')) return 'Verb';
  if (lower.startsWith('adv')) return 'Adv';
  return pos.length <= 4 ? pos : pos.slice(0, 4);
};

const getPosBadgeColors = (
  pos: string,
  colors: ReturnType<typeof useTheme>['themeColors']
) => {
  const label = formatPosLabel(pos);
  if (label === 'Adj') {
    return {
      text: colors.tertiary,
      bg: colors.tertiary + '18',
      border: colors.tertiary + '30',
    };
  }
  return {
    text: colors.secondary,
    bg: colors.secondary + '18',
    border: colors.secondary + '30',
  };
};

const highlightMatch = (word: string, query: string, primaryColor: string) => {
  if (!query.trim()) {
    return <Text>{word}</Text>;
  }

  const lowerWord = word.toLowerCase();
  const lowerQuery = query.trim().toLowerCase();
  const idx = lowerWord.indexOf(lowerQuery);

  if (idx < 0) {
    return <Text>{word}</Text>;
  }

  const before = word.slice(0, idx);
  const match = word.slice(idx, idx + lowerQuery.length);
  const after = word.slice(idx + lowerQuery.length);

  return (
    <Text>
      {before}
      <Text style={{ fontWeight: '700', color: primaryColor }}>{match}</Text>
      {after}
    </Text>
  );
};

export const SearchSuggestionsPanel: React.FC<SearchSuggestionsPanelProps> = ({
  query,
  suggestions,
  onSelect,
  visible,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  const capped = useMemo(() => suggestions.slice(0, 6), [suggestions]);

  if (!visible || capped.length === 0) return null;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.outlineVariant + '40',
          shadowColor: themeColors.primary,
        },
      ]}
    >
      {capped.map((item, idx) => {
        const badge = getPosBadgeColors(item.partOfSpeech, themeColors);
        return (
          <TouchableOpacity
            key={`${item.word}-${idx}`}
            onPress={() => onSelect(item.word)}
            style={[
              styles.row,
              {
                borderBottomColor:
                  idx < capped.length - 1
                    ? themeColors.surfaceVariant + '80'
                    : 'transparent',
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name="search" size={18} color={themeColors.outlineVariant} />
              <Text
                style={[
                  styles.wordText,
                  {
                    color: themeColors.onSurface,
                    fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={1}
              >
                {highlightMatch(
                  item.word.charAt(0).toUpperCase() + item.word.slice(1),
                  query,
                  themeColors.primary
                )}
              </Text>
            </View>
            <View
              style={[
                styles.posBadge,
                { backgroundColor: badge.bg, borderColor: badge.border },
              ]}
            >
              <Text style={[styles.posText, { color: badge.text }]}>
                {formatPosLabel(item.partOfSpeech)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.stackSm,
    borderRadius: rounded.xl,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  wordText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    flex: 1,
  },
  posBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.sm,
    borderWidth: 1,
    flexShrink: 0,
  },
  posText: {
    fontFamily: 'Inter',
    fontSize: typography.labelCaps.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
