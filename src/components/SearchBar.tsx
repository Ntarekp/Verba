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

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  onSubmit, 
  onClear, 
  placeholder,
  onFocus
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { themeColors } = useTheme();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: themeColors.surfaceContainerLowest, 
        borderColor: isFocused ? themeColors.primary : themeColors.outlineVariant 
      }
    ]}>
      <MaterialIcons name="search" size={22} color={themeColors.outline} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: themeColors.onSurface }]}
        placeholder={placeholder || "Search millions of words..."}
        placeholderTextColor={`${themeColors.outline}B0`}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => {
          setIsFocused(true);
          if (onFocus) onFocus();
        }}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={onClear} style={styles.iconBtn}>
          <MaterialIcons name="close" size={20} color={themeColors.outline} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            Alert.alert(
              'Voice Search',
              'Voice search is not available yet. Please type the word you want to look up.'
            )
          }
          accessibilityLabel="Voice search unavailable"
          accessibilityRole="button"
        >
          <MaterialIcons name="mic" size={20} color={themeColors.tertiary} />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: '100%',
  },
  iconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
