import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { rounded, typography } from '../../styles/theme';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  rightAction?: React.ReactNode;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  icon,
  error,
  rightAction,
  secureTextEntry,
  ...inputProps
}) => {
  const { themeColors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: themeColors.onSurfaceVariant }]}>{label}</Text>
        {rightAction}
      </View>
      <View
        style={[
          styles.field,
          {
            borderColor: error
              ? themeColors.error
              : focused
                ? themeColors.primary
                : themeColors.outlineVariant,
            backgroundColor: themeColors.surfaceContainerLowest + 'CC',
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={focused ? themeColors.primary : themeColors.onSurfaceVariant + '99'}
        />
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          style={[styles.input, { color: themeColors.onSurface }]}
          placeholderTextColor={themeColors.onSurfaceVariant + '80'}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            style={styles.eyeBtn}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <MaterialIcons
              name={hidden ? 'visibility' : 'visibility-off'}
              size={20}
              color={themeColors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, { color: themeColors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: typography.labelCaps.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: rounded.xl,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 4,
  },
  error: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
