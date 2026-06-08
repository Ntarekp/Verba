import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface ErrorViewProps {
  type: '404' | 'offline' | 'timeout' | 'server';
  onRetry?: () => void;
  onBack?: () => void;
  onNavigateToSaved?: () => void;
  query?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ 
  type, 
  onRetry, 
  onBack,
  onNavigateToSaved,
  query 
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  const getContent = () => {
    switch (type) {
      case '404':
        return {
          icon: 'find-in-page',
          title: 'Word Not Found',
          desc: `We could not find "${query || 'this word'}" in the dictionary. Check the spelling or try another word.`,
          actionLabel: 'Try Again',
          actionIcon: 'refresh' as const,
        };
      case 'offline':
        return {
          icon: 'wifi-off',
          title: "You're offline",
          desc: 'Verba requires an active connection to process new definitions. Your saved words are still available.',
          actionLabel: 'Try Again',
          actionIcon: 'refresh' as const,
          secondaryLabel: 'Access Saved Words',
        };
      case 'timeout':
      case 'server':
      default:
        return {
          icon: 'cloud-off',
          title: 'Connection Lost',
          desc: "We're having trouble reaching the dictionary servers. Please check your connection and try again.",
          actionLabel: 'Retry Connection',
          actionIcon: 'refresh' as const,
          errorCode: 'API_TIMEOUT_503',
          errorDetail: 'The connection request exceeded the 15s limit. This is usually temporary.',
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

      {/* Error code info box (T1.5 — connection error) */}
      {(content as any).errorCode && (
        <View style={[styles.errorCodeBox, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '40' }]}>
          <MaterialIcons name="info-outline" size={16} color={themeColors.error} style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.errorCodeLabel, { color: themeColors.onSurfaceVariant }]}>
              ERROR CODE: {(content as any).errorCode}
            </Text>
            <Text style={[styles.errorCodeDetail, { color: themeColors.onSurfaceVariant }]}>
              {(content as any).errorDetail}
            </Text>
          </View>
        </View>
      )}

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

        {/* "Access Saved Words" link for offline state (T1.4) */}
        {type === 'offline' && onNavigateToSaved ? (
          <TouchableOpacity
            onPress={onNavigateToSaved}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.secondaryBtnText, 
              { color: themeColors.secondary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
            ]}>
              Access Saved Words
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
  errorCodeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 320,
    borderRadius: rounded.default,
    borderWidth: 1,
    padding: 14,
    marginBottom: spacing.stackLg,
  },
  errorCodeLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  errorCodeDetail: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
});
