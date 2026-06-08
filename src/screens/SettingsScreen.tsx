import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, ThemeType, FontScaleType } from '../context/ThemeContext';
import { DictionaryStackParamList } from '../navigation/AppNavigator';
import { resetToOnboarding } from '../navigation/navigationHelpers';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<DictionaryStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    themeColors, 
    fontSizeMultiplier,
    themeName,
    isDarkMode,
    fontScale,
    setThemeName,
    setIsDarkMode,
    setFontScale
  } = useTheme();

  // Autoplay & Notifications — persisted to AsyncStorage (S2.3)
  const [autoplay, setAutoplayState] = useState(true);
  const [notifications, setNotificationsState] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const raw = await AsyncStorage.getItem('verba_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.autoplay !== undefined) setAutoplayState(parsed.autoplay);
          if (parsed.notifications !== undefined) setNotificationsState(parsed.notifications);
        }
      } catch (e) {
        console.warn('[Settings] Failed to load preferences', e);
      }
    };
    loadPrefs();
  }, []);

  const savePref = async (key: string, value: boolean) => {
    try {
      const raw = await AsyncStorage.getItem('verba_settings');
      const current = raw ? JSON.parse(raw) : {};
      current[key] = value;
      await AsyncStorage.setItem('verba_settings', JSON.stringify(current));
    } catch (e) {
      console.warn('[Settings] Failed to save preference', e);
    }
  };

  const setAutoplay = (val: boolean) => { setAutoplayState(val); savePref('autoplay', val); };
  const setNotifications = (val: boolean) => { setNotificationsState(val); savePref('notifications', val); };

  const handleLogout = () => {
    Alert.alert(
      'Reset App',
      'This will return you to the onboarding screen. Your saved words and search history will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('verba_first_launch_done');
            } catch (e) {
              console.warn('[Settings] Failed to reset first-launch flag', e);
            }
            resetToOnboarding(navigation);
          },
        },
      ]
    );
  };

  const themes: { name: ThemeType; color: string }[] = [
    { name: 'Classic', color: '#3525cd' },
    { name: 'Royal', color: '#0b1c30' },
    { name: 'Midnight', color: '#4f46e5' }
  ];

  const fontScales: FontScaleType[] = ['Small', 'Medium', 'Large'];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle, 
            { color: themeColors.onSurface, fontSize: typography.sectionHeading.fontSize * 0.8 * fontSizeMultiplier }
          ]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.onSurfaceVariant }]}>
            Manage your app preferences and settings.
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {/* Appearance Group */}
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.primary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
              <MaterialIcons name="palette" size={18} /> Appearance
            </Text>
            
            <View style={[styles.row, { borderBottomColor: themeColors.outlineVariant + '20' }]}>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Dark Mode</Text>
                <Text style={[styles.rowSubtitle, { color: themeColors.onSurfaceVariant, fontSize: 13 * fontSizeMultiplier }]}>Adjust app visual theme</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: themeColors.outlineVariant, true: themeColors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.row, { borderBottomColor: themeColors.outlineVariant + '20' }]}>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Theme Selection</Text>
                <Text style={[styles.rowSubtitle, { color: themeColors.onSurfaceVariant, fontSize: 13 * fontSizeMultiplier }]}>Select brand accent colors</Text>
              </View>
              <View style={styles.themeRow}>
                {themes.map((t) => (
                  <TouchableOpacity
                    key={t.name}
                    onPress={() => setThemeName(t.name)}
                    style={[
                      styles.themeCircle,
                      { 
                        backgroundColor: t.color,
                        borderColor: themeName === t.name ? themeColors.onSurface : 'transparent',
                        borderWidth: themeName === t.name ? 2 : 0
                      }
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.columnRow}>
              <View style={styles.fontScaleLabelRow}>
                <Text style={[styles.rowTitle, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Font Size Scale</Text>
                <Text style={[styles.fontScaleValue, { color: themeColors.primary }]}>{fontScale}</Text>
              </View>
              <View style={styles.fontScaleContainer}>
                {fontScales.map((scale) => (
                  <TouchableOpacity
                    key={scale}
                    onPress={() => setFontScale(scale)}
                    style={[
                      styles.fontScaleBtn,
                      { 
                        backgroundColor: fontScale === scale ? themeColors.primaryContainer : themeColors.surfaceContainerLow,
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.fontScaleBtnText,
                      { 
                        color: fontScale === scale ? themeColors.onPrimaryContainer : themeColors.onSurfaceVariant,
                        fontWeight: fontScale === scale ? '700' : '400'
                      }
                    ]}>
                      {scale}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Preferences Group */}
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.primary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
              <MaterialIcons name="tune" size={18} /> Preferences
            </Text>

            <View style={[styles.row, { borderBottomColor: themeColors.outlineVariant + '20' }]}>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Audio Autoplay</Text>
                <Text style={[styles.rowSubtitle, { color: themeColors.onSurfaceVariant, fontSize: 13 * fontSizeMultiplier }]}>Play pronunciation on load</Text>
              </View>
              <Switch
                value={autoplay}
                onValueChange={setAutoplay}
                trackColor={{ false: themeColors.outlineVariant, true: themeColors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.row}>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Daily Reminders</Text>
                <Text style={[styles.rowSubtitle, { color: themeColors.onSurfaceVariant, fontSize: 13 * fontSizeMultiplier }]}>Streak notifications status</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: themeColors.outlineVariant, true: themeColors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* App Info Group */}
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.primary, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
              <MaterialIcons name="info" size={18} /> App Info
            </Text>

            <TouchableOpacity 
              style={[styles.clickableRow, { borderBottomColor: themeColors.outlineVariant + '20' }]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/verba-app')}
              accessibilityLabel="Open Privacy Policy"
              accessibilityRole="link"
            >
              <View style={styles.clickableRowLeft}>
                <MaterialIcons name="shield" size={18} color={themeColors.onSurfaceVariant} />
                <Text style={[styles.clickableRowText, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="open-in-new" size={18} color={themeColors.outline} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.clickableRow, { borderBottomColor: themeColors.outlineVariant + '20' }]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:support@lexitech.rw?subject=Verba%20Support')}
              accessibilityLabel="Contact Help and Support"
              accessibilityRole="link"
            >
              <View style={styles.clickableRowLeft}>
                <MaterialIcons name="help-center" size={18} color={themeColors.onSurfaceVariant} />
                <Text style={[styles.clickableRowText, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>Help Center</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={themeColors.outline} />
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <View style={styles.clickableRowLeft}>
                <MaterialIcons name="update" size={18} color={themeColors.onSurfaceVariant} />
                <Text style={[styles.clickableRowText, { color: themeColors.onSurface, fontSize: 16 * fontSizeMultiplier }]}>App Version</Text>
              </View>
              <Text style={[styles.versionText, { color: themeColors.outline }]}>v2.5.0</Text>
            </View>
          </View>
        </View>

        {/* Log Out button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: themeColors.errorContainer + '40', borderColor: themeColors.error + '40' }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutBtnText, { color: themeColors.error, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.gutter,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.stackLg,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    opacity: 0.8,
  },
  sectionsContainer: {
    gap: spacing.stackMd,
    marginBottom: spacing.stackLg,
  },
  sectionCard: {
    borderRadius: rounded.xl,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  rowSubtitle: {
    fontFamily: 'Inter',
    opacity: 0.8,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  columnRow: {
    paddingVertical: 12,
  },
  fontScaleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fontScaleValue: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  fontScaleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fontScaleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: rounded.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontScaleBtnText: {
    fontFamily: 'Inter',
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  clickableRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clickableRowText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  versionText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: rounded.full,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.stackSm,
  },
  logoutBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});
