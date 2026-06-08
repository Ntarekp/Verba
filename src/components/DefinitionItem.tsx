import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Definition } from '../models/DictionaryTypes';
import { useTheme } from '../context/ThemeContext';
import { ExampleText } from './ExampleText';
import { spacing, typography } from '../styles/theme';

interface DefinitionItemProps {
  index: number;
  definition: Definition;
}

export const DefinitionItem: React.FC<DefinitionItemProps> = ({ index, definition }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View style={styles.container}>
      {/* Left indicator bar */}
      <View style={[styles.indicator, { backgroundColor: themeColors.primary }]} />
      
      <View style={styles.content}>
        <Text style={[
          styles.definitionText, 
          { color: themeColors.onSurface, fontSize: typography.definitionBody.fontSize * fontSizeMultiplier }
        ]}>
          <Text style={[styles.indexNumber, { color: themeColors.primary }]}>{index}. </Text>
          {definition.definition}
        </Text>
        
        {definition.example ? (
          <ExampleText text={definition.example} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.stackMd,
    paddingLeft: 4,
  },
  indicator: {
    width: 2,
    borderRadius: 99,
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingVertical: 2,
  },
  definitionText: {
    fontFamily: 'Inter',
    lineHeight: 26,
    fontWeight: '400',
  },
  indexNumber: {
    fontWeight: '700',
  },
});
