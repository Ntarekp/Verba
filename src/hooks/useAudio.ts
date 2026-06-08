import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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
        console.warn('[useAudio] Could not configure audio session. ExponentAV may not be available in this environment.', e);
      }
    };

    configureAudioSession();

    return () => {
      // Clean up sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsLoading(status.isBuffering);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setIsLoading(false);
      }
    } else {
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
        setIsPlaying(false);
        setIsLoading(false);
      }
    }
  };

  const playAudio = async (url: string) => {
    if (!url) {
      Alert.alert('Pronunciation Unavailable', 'No audio stream was provided for this phonetic spelling.');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentUrl(url);

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
      console.error('Failed to play audio', e);
      setIsLoading(false);
      setIsPlaying(false);

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
        Alert.alert('Pronunciation Error', 'Failed to buffer pronunciation audio. Please check your internet connection.');
      }
    }
  };

  return {
    playAudio,
    isPlaying,
    isLoading,
    currentUrl,
  };
};
