import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Enable audio playback in silent mode for iOS.
    // Wrapped in try/catch: if ExponentAV native module is unavailable
    // (e.g. running in a non-standard Expo Go build), this will not crash the app.
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch (e) {
        console.warn(
          '[useAudio] Could not configure audio session. ExponentAV may not be available in this environment.',
          e
        );
      }
    };

    configureAudioSession();

    return () => {
      // Clean up sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsLoading(status.isBuffering);
      setIsPlaying(status.isPlaying);
      setIsPaused(!status.isPlaying && status.positionMillis > 0 && !status.didJustFinish);

      if (status.didJustFinish) {
        // Audio completed — reset all states
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
      }
    } else {
      if (status.error) {
        console.error(`[useAudio] Playback error: ${status.error}`);
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
      }
    }
  };

  /**
   * Load and play audio from a URL.
   * If a different URL is already loaded, it will be unloaded first.
   * If the same URL is loaded and paused, resumes instead of reloading.
   */
  const playAudio = async (url: string) => {
    if (!url) {
      Alert.alert(
        'Pronunciation Unavailable',
        'No audio stream was provided for this phonetic spelling.'
      );
      return;
    }

    try {
      // If same URL is loaded and paused — resume instead of reloading
      if (soundRef.current && currentUrl === url && isPaused) {
        await soundRef.current.playAsync();
        return;
      }

      setIsLoading(true);
      setCurrentUrl(url);
      setIsPaused(false);

      // Stop and unload any previously playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (e: any) {
      console.error('[useAudio] Failed to play audio', e);
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);

      // Provide a specific message if it's a missing native module error
      const isNativeModuleError =
        e?.message?.includes('ExponentAV') ||
        e?.message?.includes('Native module') ||
        e?.code === 'ERR_UNAVAILABLE';

      if (isNativeModuleError) {
        Alert.alert(
          'Audio Unavailable',
          'Pronunciation playback requires a development build. Run "npx expo run:android" or "npx expo run:ios" to enable audio.'
        );
      } else {
        Alert.alert(
          'Pronunciation Error',
          'Failed to buffer pronunciation audio. Please check your internet connection.'
        );
      }
    }
  };

  /**
   * Pause currently playing audio.
   * State is preserved so playAudio() on the same URL will resume.
   */
  const pauseAudio = async () => {
    if (!soundRef.current || !isPlaying) return;
    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      setIsPaused(true);
    } catch (e) {
      console.error('[useAudio] Failed to pause audio', e);
    }
  };

  /**
   * Stop and unload audio entirely, resetting all state.
   */
  const stopAudio = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      setCurrentUrl(null);
    } catch (e) {
      console.error('[useAudio] Failed to stop audio', e);
    }
  };

  /**
   * Toggle between play and pause for the current URL.
   * If nothing is loaded, does nothing.
   */
  const togglePlayPause = async (url: string) => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio(url);
    }
  };

  return {
    playAudio,
    pauseAudio,
    stopAudio,
    togglePlayPause,
    isPlaying,
    isPaused,
    isLoading,
    currentUrl,
  };
};
