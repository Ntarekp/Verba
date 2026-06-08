import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Enable audio playback in silent mode for iOS
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    return () => {
      // Clean up sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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
    } catch (e) {
      console.error('Failed to play audio', e);
      setIsLoading(false);
      setIsPlaying(false);
      Alert.alert('Pronunciation Error', 'Failed to buffer pronunciation audio. Please check your internet connection.');
    }
  };

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

  return {
    playAudio,
    isPlaying,
    isLoading,
    currentUrl,
  };
};
