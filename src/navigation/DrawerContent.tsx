import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../context/HistoryContext';
import { useSaved } from '../context/SavedContext';
import { navigateToWordDetails } from './navigationHelpers';
import { rounded, spacing, typography } from '../styles/theme';

const RECENT_HISTORY_LIMIT = 8;

type NavItemConfig = {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
};

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({
  navigation,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { user } = useAuth();
  const { history } = useHistory();
  const { savedWords, streakCount } = useSaved();
  const insets = useSafeAreaInsets();

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const goToTab = (screen: 'Dictionary' | 'History' | 'Saved', params?: object) => {
    closeDrawer();
    navigation.navigate('MainTabs', { screen, params });
  };

  const navItems: NavItemConfig[] = [
    {
      label: 'Home',
      icon: 'home',
      onPress: () =>
        goToTab('Dictionary', { screen: 'Discover' }),
    },
    {
      label: 'Search History',
      icon: 'history',
      onPress: () => goToTab('History'),
    },
    {
      label: 'Saved Words',
      icon: 'bookmark',
      onPress: () => goToTab('Saved'),
    },
    {
      label: 'Settings',
      icon: 'settings',
      onPress: () =>
        goToTab('Dictionary', { screen: 'Settings' }),
    },
  ];

  const recentHistory = history.slice(0, RECENT_HISTORY_LIMIT);

  const handleHistoryWordPress = (word: string) => {
    closeDrawer();
    navigateToWordDetails(navigation, word);
  };

  const displayName = user?.name ?? 'Verba User';
  const displayEmail = user?.email ?? '';

  return (
    <DrawerContentScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + spacing.stackMd,
          paddingBottom: insets.bottom + spacing.stackMd,
          backgroundColor: themeColors.surfaceContainer,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={styles.profileSection}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: themeColors.primaryContainer,
              borderColor: themeColors.primary + '33',
            },
          ]}
        >
          <MaterialIcons
            name="person"
            size={32}
            color={themeColors.onPrimaryContainer}
          />
        </View>
        <View style={styles.profileText}>
          <Text
            style={[
              styles.profileName,
              {
                color: themeColors.onSurface,
                fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
              },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {displayEmail ? (
            <Text
              style={[styles.profileEmail, { color: themeColors.primary }]}
              numberOfLines={1}
            >
              {displayEmail}
            </Text>
          ) : null}
          <Text style={[styles.profileStat, { color: themeColors.onSurfaceVariant }]}>
            {savedWords.length} saved · {streakCount} day streak
          </Text>
        </View>
      </View>

      {/* Primary navigation */}
      <View style={styles.navSection}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.navItem,
              { backgroundColor: themeColors.surfaceContainerLowest + '00' },
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <MaterialIcons
              name={item.icon}
              size={22}
              color={themeColors.secondary}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: themeColors.onSurface,
                  fontSize: typography.buttonText.fontSize * fontSizeMultiplier,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[styles.divider, { backgroundColor: themeColors.outlineVariant + '50' }]}
      />

      {/* Recent searches — Activity 4: history in drawer menu */}
      <View style={styles.historySection}>
        <Text
          style={[
            styles.historyHeading,
            {
              color: themeColors.outline,
              fontSize: typography.labelCaps.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          RECENT SEARCHES
        </Text>

        {recentHistory.length === 0 ? (
          <Text
            style={[
              styles.emptyHistory,
              { color: themeColors.onSurfaceVariant },
            ]}
          >
            No searches yet. Look up a word to build your history.
          </Text>
        ) : (
          recentHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.historyRow,
                { backgroundColor: themeColors.surfaceContainerLowest },
              ]}
              onPress={() => handleHistoryWordPress(item.word)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Search ${item.word}`}
            >
              <MaterialIcons
                name="search"
                size={18}
                color={themeColors.outline}
              />
              <View style={styles.historyRowText}>
                <Text
                  style={[
                    styles.historyWord,
                    {
                      color: themeColors.onSurface,
                      fontSize: typography.buttonText.fontSize * 0.9 * fontSizeMultiplier,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.word.charAt(0).toUpperCase() + item.word.slice(1)}
                </Text>
                {item.partOfSpeech ? (
                  <Text
                    style={[
                      styles.historyPos,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                    numberOfLines={1}
                  >
                    {item.partOfSpeech}
                  </Text>
                ) : null}
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={themeColors.outlineVariant}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.containerPadding,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutter,
    marginBottom: spacing.stackLg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  profileName: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  profileEmail: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  profileStat: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  navSection: {
    gap: spacing.unit,
    marginBottom: spacing.stackMd,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutter,
    paddingVertical: 12,
    paddingHorizontal: spacing.gutter,
    borderRadius: rounded.lg,
  },
  navLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: spacing.stackMd,
  },
  historySection: {
    gap: spacing.stackSm,
  },
  historyHeading: {
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.05 * 12,
    textTransform: 'uppercase',
    marginBottom: spacing.unit,
  },
  emptyHistory: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: spacing.stackSm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingVertical: 10,
    paddingHorizontal: spacing.gutter,
    borderRadius: rounded.default,
    marginBottom: spacing.unit,
  },
  historyRowText: {
    flex: 1,
    minWidth: 0,
  },
  historyWord: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  historyPos: {
    fontFamily: 'Inter',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
