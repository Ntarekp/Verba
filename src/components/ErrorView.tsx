import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from './GlassCard';
import { rounded, spacing, typography } from '../styles/theme';

export type ErrorViewType =
  | '404'
  | 'offline'
  | 'timeout'
  | 'connection_error'
  | 'server'
  | 'unexpected';

interface ErrorViewProps {
  type: ErrorViewType;
  onRetry?: () => void;
  onBack?: () => void;
  onNavigateToSaved?: () => void;
  onSearchNew?: (word: string) => void;
  query?: string;
  savedCount?: number;
}

const NOT_FOUND_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5q_DdqqXAUYuQhYbbS-5T6RDeHPQhVfyR4AsOUd1qwn_8X9rz65y0fBVAynj5hhoZmgix-e-5RIGJBt4C9m9OiyNwpv7rIElXJ_-loiujuNPQP_87NLoIUZn29fjaOPiqArDEa_yCG4fxL_3OzUrDoASGF7vHE9kbtz2qCMb4ixsUHbfP3PyjRHkbv2nnmtZJrs_lM90LTOlQnapGezBuRd_S4jNjesmzVesYQSKX4LhvhRXD8c8IP1l01mKK5Ntwnk0lOGq4xg';

export const ErrorView: React.FC<ErrorViewProps> = ({
  type,
  onRetry,
  onBack,
  onNavigateToSaved,
  onSearchNew,
  query,
  savedCount = 0,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const [retryLoading, setRetryLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetryLoading(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetryLoading(false), 600);
    }
  };

  const getContent = () => {
    switch (type) {
      case '404':
        return {
          title: 'Linguistic Discovery Pending',
          desc: 'This word seems to be outside our current index. The lexicons are ever-expanding, and you might have just found a gap.',
          actionLabel: 'Request Word',
          actionIcon: 'add-circle-outline' as const,
          showSearch: true,
        };
      case 'offline':
        return {
          title: "You're offline",
          desc: 'Verba requires an active connection to process new definitions. Your saved words are still available.',
          actionLabel: 'Try Again',
          actionIcon: 'refresh' as const,
          secondaryLabel: 'Access Saved Words',
          showStatusGrid: true,
        };
      case 'timeout':
        return {
          title: 'Connection Lost',
          desc: "We're having trouble reaching the dictionary servers. Please check your connection and try again.",
          actionLabel: 'Retry Connection',
          actionIcon: 'refresh' as const,
          badge: 'Error 503 • Timeout',
          secondaryLink: 'Check System Status',
        };
      case 'connection_error':
        return {
          title: 'Connection Failed',
          desc: "We couldn't reach the linguistic database. The server might be experiencing high load or maintenance.",
          actionLabel: 'Retry',
          actionIcon: 'refresh' as const,
          cancelLabel: 'Cancel',
        };
      case 'unexpected':
        return {
          title: 'Something went astray',
          desc: 'An unexpected error occurred while searching the lexicon. Please try again or contact support.',
          actionLabel: 'Retry Discovery',
          actionIcon: 'refresh' as const,
          secondaryLabel: 'Contact Support',
        };
      case 'server':
      default:
        return {
          title: 'Server Error',
          desc: 'The dictionary service returned an unexpected response. Please try again shortly.',
          actionLabel: 'Try Again',
          actionIcon: 'refresh' as const,
          errorCode: 'SERVER_ERROR',
          errorDetail: 'The server could not process your request.',
        };
    }
  };

  const content = getContent();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.blurBlob, { backgroundColor: themeColors.primaryFixedDim + '12' }]} />

      {type === '404' ? (
        <View style={styles.heroImageWrap}>
          <Image source={{ uri: NOT_FOUND_IMAGE }} style={styles.heroImage} />
        </View>
      ) : (
        <View style={[styles.illustrationSquare, { backgroundColor: themeColors.surfaceContainerHigh }]}>
          <MaterialIcons
            name={
              type === 'offline'
                ? 'wifi-off'
                : type === 'unexpected'
                  ? 'error-outline'
                  : 'cloud-off'
            }
            size={72}
            color={type === 'unexpected' ? themeColors.error : themeColors.primary}
          />
          {type === 'offline' && (
            <View style={[styles.errorBadge, { backgroundColor: themeColors.errorContainer }]}>
              <MaterialIcons name="error" size={16} color={themeColors.error} />
            </View>
          )}
        </View>
      )}

      {(content as any).badge ? (
        <View style={[styles.badge, { backgroundColor: themeColors.errorContainer }]}>
          <Text style={[styles.badgeText, { color: themeColors.error }]}>
            {(content as any).badge}
          </Text>
        </View>
      ) : null}

      <Text
        style={[
          styles.title,
          {
            color: themeColors.primary,
            fontSize:
              type === 'timeout'
                ? typography.displayWordMobile.fontSize * 0.55 * fontSizeMultiplier
                : typography.sectionHeading.fontSize * 0.8 * fontSizeMultiplier,
          },
        ]}
      >
        {content.title}
      </Text>

      <Text
        style={[
          styles.desc,
          {
            color: themeColors.onSurfaceVariant,
            fontSize: typography.caption.fontSize * fontSizeMultiplier,
          },
        ]}
      >
        {content.desc}
      </Text>

      {(content as any).showStatusGrid ? (
        <View style={styles.statusGrid}>
          <GlassCard padding={14} borderRadius={rounded.lg} style={styles.statusCell}>
            <Text style={[styles.statusLabel, { color: themeColors.onSurfaceVariant }]}>Network</Text>
            <Text style={[styles.statusValue, { color: themeColors.error }]}>Offline</Text>
          </GlassCard>
          <GlassCard padding={14} borderRadius={rounded.lg} style={styles.statusCell}>
            <Text style={[styles.statusLabel, { color: themeColors.onSurfaceVariant }]}>Local Cache</Text>
            <Text style={[styles.statusValue, { color: themeColors.primary }]}>
              {savedCount} words
            </Text>
          </GlassCard>
        </View>
      ) : null}

      {(content as any).errorCode ? (
        <View
          style={[
            styles.errorCodeBox,
            {
              backgroundColor: themeColors.surfaceContainerLowest,
              borderColor: themeColors.outlineVariant + '40',
            },
          ]}
        >
          <MaterialIcons name="info-outline" size={16} color={themeColors.error} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.errorCodeLabel, { color: themeColors.onSurfaceVariant }]}>
              ERROR CODE: {(content as any).errorCode}
            </Text>
            <Text style={[styles.errorCodeDetail, { color: themeColors.onSurfaceVariant }]}>
              {(content as any).errorDetail}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionContainer}>
        {(content as any).showSearch ? (
          <GlassCard padding={8} borderRadius={rounded.lg} style={styles.searchCard}>
            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={22} color={themeColors.outline} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Try another word..."
                placeholderTextColor={themeColors.outline}
                style={[styles.searchInput, { color: themeColors.onSurface }]}
                onSubmitEditing={() => {
                  const trimmed = searchText.trim();
                  if (trimmed && onSearchNew) onSearchNew(trimmed);
                }}
                returnKeyType="search"
              />
              <MaterialIcons name="mic" size={22} color={themeColors.tertiary} />
            </View>
          </GlassCard>
        ) : null}

        {type === '404' ? (
          <TouchableOpacity
            onPress={() => {
              const trimmed = searchText.trim();
              if (trimmed && onSearchNew) {
                onSearchNew(trimmed);
              } else {
                Alert.alert(
                  'Request Word',
                  'Thank you! Word requests help expand the lexicon in future updates.'
                );
              }
            }}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Request Word</Text>
          </TouchableOpacity>
        ) : onRetry ? (
          <TouchableOpacity
            onPress={handleRetry}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.8}
            disabled={retryLoading}
          >
            {retryLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name={content.actionIcon as any} size={20} color="#fff" />
                <Text
                  style={[
                    styles.primaryBtnText,
                    { fontSize: typography.buttonText.fontSize * fontSizeMultiplier },
                  ]}
                >
                  {content.actionLabel}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {type === 'offline' && onNavigateToSaved ? (
          <TouchableOpacity onPress={onNavigateToSaved} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: themeColors.secondary }]}>
              Access Saved Words
            </Text>
          </TouchableOpacity>
        ) : null}

        {type === 'connection_error' && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: themeColors.onSurfaceVariant }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : null}

        {type === 'unexpected' ? (
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Support', 'Email support@lexitech.rw for assistance.')
            }
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: themeColors.secondary }]}>
              Contact Scholar Support
            </Text>
          </TouchableOpacity>
        ) : null}

        {onBack && type !== 'connection_error' ? (
          <TouchableOpacity onPress={onBack} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={[styles.secondaryBtnText, { color: themeColors.secondary }]}>
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
    padding: spacing.containerPadding,
  },
  blurBlob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '18%',
  },
  heroImageWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: spacing.stackLg,
    shadowColor: 'rgba(53, 37, 205, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  heroImage: { width: '100%', height: '100%' },
  illustrationSquare: {
    width: 140,
    height: 140,
    borderRadius: rounded.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.stackLg,
  },
  errorBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.full,
    marginBottom: spacing.stackSm,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    marginBottom: spacing.stackMd,
    maxWidth: 320,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing.stackMd,
  },
  statusCell: { flex: 1, minWidth: 0 },
  statusLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
  },
  errorCodeBox: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 320,
    borderRadius: rounded.default,
    borderWidth: 1,
    padding: 14,
    marginBottom: spacing.stackMd,
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
  actionContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  searchCard: { marginBottom: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    paddingVertical: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: rounded.xl,
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
