import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSaved } from '../context/SavedContext';
import { rounded, spacing, typography } from '../styles/theme';

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const { state, navigation } = props;
  const { themeColors, fontSizeMultiplier } = useTheme();
  const { savedWords, streakCount } = useSaved();

  const activeRouteName = state.routeNames[state.index];

  const menuItems = [
    { name: 'Discover', label: 'Home', icon: 'home' },
    { name: 'SavedWords', label: 'Saved Words', icon: 'bookmark' },
    { name: 'History', label: 'History', icon: 'history' },
    { name: 'Settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surface }]}>
      {/* Profile Banner */}
      <View style={[styles.profileSection, { borderBottomColor: themeColors.outlineVariant + '30' }]}>
        <View style={[styles.avatarContainer, { backgroundColor: themeColors.surfaceVariant }]}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDyTkQJG4RASNkD0r-uWzk3ak5ZQfvSw_aSIE-pms9-YTMsUR1HAydDdGIi9lZtlDbpuBEpXZCnheR9xf6xQ_VnTn3AZksm1uMyh7CgiaksU8Z59JLgLOgBk9IWKueux55xIDrGOOTDvzX9UuTR2BOr48tfE_jLyZevcpec8_fSEQ8o4Sp8tdTvIZ20uALPvNLMJ6lbYBppsiMpYYdLT-CuCoX3CwPD_qbg1X54MzYFA85r_3p9NNizGL92PT_bfgn7Dp7ppL8fw' }} 
            style={styles.avatar}
          />
        </View>
        <View style={styles.profileText}>
          <Text style={[
            styles.profileName, 
            { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
          ]}>
            Language Explorer
          </Text>
          <Text style={[
            styles.profileTier, 
            { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
          ]}>
            Verba Premium • Lvl 12
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-fire-department" size={14} color={themeColors.tertiary} />
              <Text style={[styles.statValue, { color: themeColors.tertiary }]}>{streakCount}d</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="workspace-premium" size={14} color={themeColors.primary} />
              <Text style={[styles.statValue, { color: themeColors.primary }]}>{savedWords.length} words</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu links ScrollView */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const isActive = activeRouteName === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => navigation.navigate(item.name)}
                style={[
                  styles.menuItem,
                  { 
                    backgroundColor: isActive 
                      ? themeColors.primaryContainer 
                      : 'transparent' 
                  }
                ]}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={item.icon as any} 
                  size={22} 
                  color={isActive ? themeColors.onPrimaryContainer : themeColors.onSurfaceVariant} 
                />
                <Text style={[
                  styles.menuItemText,
                  { 
                    color: isActive ? themeColors.onPrimaryContainer : themeColors.onSurface,
                    fontWeight: isActive ? '600' : '500',
                    fontSize: typography.buttonText.fontSize * fontSizeMultiplier 
                  }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Help & Logout footer */}
      <View style={[styles.footer, { borderTopColor: themeColors.outlineVariant + '30' }]}>
        <TouchableOpacity style={styles.footerBtn} activeOpacity={0.7}>
          <MaterialIcons name="help-outline" size={20} color={themeColors.onSurfaceVariant} />
          <Text style={[
            styles.footerBtnText, 
            { color: themeColors.onSurface, fontSize: typography.caption.fontSize * fontSizeMultiplier }
          ]}>
            Help & Support
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingTop: 24,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  profileTier: {
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingTop: 8,
  },
  menuList: {
    paddingHorizontal: 8,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: rounded.default,
    gap: 16,
  },
  menuItemText: {
    fontFamily: 'Inter',
  },
  footer: {
    padding: spacing.gutter,
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  footerBtnText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
