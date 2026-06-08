import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Meaning } from '../models/DictionaryTypes';
import { DefinitionItem } from './DefinitionItem';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface MeaningCardProps {
  meaning: Meaning;
  onSelectWord?: (word: string) => void;
}

export const MeaningCard: React.FC<MeaningCardProps> = ({ meaning, onSelectWord }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  // Combine definitions synonyms/antonyms and root-level synonyms/antonyms
  const synonyms = Array.from(new Set([
    ...(meaning.synonyms || []),
    ...meaning.definitions.flatMap(d => d.synonyms || [])
  ])).slice(0, 8); // limit to 8 for neatness

  const antonyms = Array.from(new Set([
    ...(meaning.antonyms || []),
    ...meaning.definitions.flatMap(d => d.antonyms || [])
  ])).slice(0, 8); // limit to 8 for neatness

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: themeColors.surfaceContainerLowest, 
        borderColor: themeColors.outlineVariant + '30' 
      }
    ]}>
      {/* Part of Speech Header */}
      <View style={styles.header}>
        <Text style={[
          styles.title, 
          { color: themeColors.primary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
        ]}>
          Senses as {meaning.partOfSpeech.toUpperCase()}
        </Text>
        <View style={[styles.divider, { backgroundColor: themeColors.outlineVariant + '40' }]} />
      </View>

      {/* Definitions list */}
      <View style={styles.definitionList}>
        {meaning.definitions.map((def, idx) => (
          <DefinitionItem 
            key={idx} 
            index={idx + 1} 
            definition={def} 
          />
        ))}
      </View>

      {/* Synonyms & Antonyms Bento layout */}
      {(synonyms.length > 0 || antonyms.length > 0) && (
        <View style={styles.thesaurusSection}>
          {synonyms.length > 0 && (
            <View style={[
              styles.thesaurusBox, 
              { backgroundColor: themeColors.surfaceContainerLow }
            ]}>
              <Text style={[
                styles.thesaurusLabel, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.labelCaps.fontSize * fontSizeMultiplier }
              ]}>
                SYNONYMS
              </Text>
              <View style={styles.chipContainer}>
                {synonyms.map((syn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onSelectWord && onSelectWord(syn)}
                    style={[styles.chip, { backgroundColor: themeColors.surfaceContainerHighest }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText, 
                      { color: themeColors.secondary, fontSize: typography.caption.fontSize * fontSizeMultiplier }
                    ]}>
                      {syn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {antonyms.length > 0 && (
            <View style={[
              styles.thesaurusBox, 
              { backgroundColor: themeColors.surfaceContainerLow }
            ]}>
              <Text style={[
                styles.thesaurusLabel, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.labelCaps.fontSize * fontSizeMultiplier }
              ]}>
                ANTONYMS
              </Text>
              <View style={styles.chipContainer}>
                {antonyms.map((ant, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onSelectWord && onSelectWord(ant)}
                    style={[styles.chip, { backgroundColor: themeColors.surfaceContainerHighest }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText, 
                      { color: themeColors.onSurface, fontSize: typography.caption.fontSize * fontSizeMultiplier }
                    ]}>
                      {ant}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: rounded.lg,
    padding: spacing.gutter,
    borderWidth: 1,
    marginBottom: spacing.stackMd,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.stackMd,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  definitionList: {
    marginBottom: spacing.stackSm,
  },
  thesaurusSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.stackSm,
    flexWrap: 'wrap',
  },
  thesaurusBox: {
    flex: 1,
    minWidth: 140,
    borderRadius: rounded.default,
    padding: 12,
  },
  thesaurusLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  chipText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
