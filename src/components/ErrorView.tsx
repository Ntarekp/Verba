import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface ErrorViewProps {
  type: '404' | 'offline' | 'timeout' | 'server';
  onRetry?: () => void;
  onBack?: () => void;
  query?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ 
  type, 
  onRetry, 
  onBack,
  query 
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  const getContent = () => {
    switch (type) {
      case '404':
        return {
          icon: 'find-in-page',
          title: 'Linguistic Discovery Pending',
          desc: `The word "${query || 'unknown'}" seems to be outside our current index. The lexicons are ever-expanding, and you might have just found a gap.`,
          actionLabel: 'Request Word',
          actionIcon: 'add-circle' as const,
        };
      case 'offline':
        return {
          icon: 'wifi-off',
          title: 'Connection Lost',
          desc: 'Your device is currently disconnected. Please verify your internet settings to resume lookup queries.',
          actionLabel: 'Retry Connection',
          actionIcon: 'refresh' as const,
        };
      case 'timeout':
      case 'server':
      default:
        return {
          icon: 'error-outline',
          title: 'Server Timeout',
          desc: 'Our lexicon services took too long to respond. This is usually temporary. Please try again.',
          actionLabel: 'Retry Request',
          actionIcon: 'refresh' as const,
        };
    }
  };

  const content = getContent();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Decorative Blur Background Blob */}
      <View style={[styles.blurBlob, { backgroundColor: themeColors.primaryFixedDim + '12' }]} />

      <View style={[styles.illustrationCircle, { backgroundColor: themeColors.surfaceContainerHigh }]}>
        <MaterialIcons 
          name={content.icon as any} 
          size={84} 
          color={type === '404' ? themeColors.primary : themeColors.error} 
        />
      </View>

      <Text style={[
        styles.title, 
        { color: themeColors.primary, fontSize: typography.sectionHeading.fontSize * 0.8 * fontSizeMultiplier }
      ]}>
        {content.title}
      </Text>
      
      <Text style={[
        styles.desc, 
        { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
      ]}>
        {content.desc}
      </Text>

      <View style={styles.actionContainer}>
        {onRetry ? (
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.8}
          >
            <MaterialIcons name={content.actionIcon as any} size={20} color="#fff" />
            <Text style={[
              styles.primaryBtnText, 
              { fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
            ]}>
              {content.actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}

        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.secondaryBtnText, 
              { color: themeColors.secondary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
            ]}>
              Return to Explore
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding * 1.5,
    position: 'relative',
  },
  blurBlob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '25%',
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.stackLg,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.stackSm,
  },
  desc: {
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.stackLg,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: rounded.xl,
    shadowColor: '#0058be',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
