import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'verba_settings';

export async function getAutoplayEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.autoplay !== undefined) {
        return Boolean(parsed.autoplay);
      }
    }
  } catch (e) {
    console.warn('[settingsHelper] Failed to read autoplay preference', e);
  }
  return true;
}
