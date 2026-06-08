import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded } from '../styles/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
  onFocus?: () => void;
}

const ICON_HIT = 44;

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.surface + 'B3',
          borderColor: isFocused ? themeColors.primary : 'rgba(255,255,255,0.35)',
        },
      ]}
    >
      <TouchableOpacity
        onPress={onSubmit}
        style={styles.iconHit}
        accessibilityLabel="Search"
        accessibilityRole="button"
      >
        <MaterialIcons name="search" size={22} color={themeColors.outline} />
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          {
            color: themeColors.onSurface,
            fontSize: 16 * fontSizeMultiplier,
            lineHeight: 22 * fontSizeMultiplier,
          },
        ]}
        placeholder={placeholder || 'Search millions of words...'}
        placeholderTextColor={`${themeColors.outline}B0`}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value.length > 0 ? (
        <TouchableOpacity onPress={onClear} style={styles.iconHit} accessibilityLabel="Clear search">
          <MaterialIcons name="close" size={22} color={themeColors.outline} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.iconHit}
          onPress={() =>
            Alert.alert(
              'Voice Search',
              'Voice search is not available yet. Please type the word you want to look up.'
            )
          }
          accessibilityLabel="Voice search unavailable"
          accessibilityRole="button"
        >
          <MaterialIcons name="mic" size={22} color={themeColors.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: rounded.full,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 52,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconHit: {
    width: ICON_HIT,
    height: ICON_HIT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
