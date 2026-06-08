import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

interface AudioContextValue {
  playAudio: (url: string) => Promise<void>;
  pauseAudio: () => Promise<void>;
  stopAudio: () => Promise<void>;
  togglePlayPause: (url: string) => Promise<void>;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentUrl: string | null;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

/** Safely stop and unload a captured Sound instance (never uses soundRef). */
async function unloadSoundInstance(sound: Audio.Sound): Promise<void> {
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.stopAsync();
      }
      await sound.unloadAsync();
    }
  } catch {
    // Sound may already be released — ignore
  }
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isCleaningUp = useRef(false);
  const isPausedRef = useRef(false);
  const currentUrlRef = useRef<string | null>(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    currentUrlRef.current = currentUrl;
  }, [currentUrl]);

  useEffect(() => {
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch (e) {
        console.warn('[AudioProvider] Could not configure audio session.', e);
      }
    };

    configureAudioSession();

    return () => {
      const sound = soundRef.current;
      soundRef.current = null;
      if (sound) {
        unloadSoundInstance(sound);
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setIsLoading(status.isBuffering);
      setIsPlaying(status.isPlaying);
      setIsPaused(
        !status.isPlaying && status.positionMillis > 0 && !status.didJustFinish
      );

      if (status.didJustFinish) {
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
      }
    } else if (status.error) {
      console.error(`[AudioProvider] Playback error: ${status.error}`);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
    }
  }, []);

  const stopAudio = useCallback(async () => {
    if (isCleaningUp.current) return;

    const sound = soundRef.current;
    if (!sound) return;

    // Snapshot pattern: detach ref before any async work
    isCleaningUp.current = true;
    soundRef.current = null;
    setCurrentUrl(null);
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);

    try {
      await unloadSoundInstance(sound);
    } catch (e) {
      console.warn('[AudioProvider] Failed to stop audio', e);
    } finally {
      isCleaningUp.current = false;
    }
  }, []);

  const playAudio = useCallback(
    async (url: string) => {
      if (!url) {
        Alert.alert(
          'Pronunciation Unavailable',
          'No audio stream was provided for this phonetic spelling.'
        );
        return;
      }

      if (isCleaningUp.current) return;

      try {
        // Resume paused audio for the same URL without reloading
        if (
          soundRef.current &&
          currentUrlRef.current === url &&
          isPausedRef.current
        ) {
          await soundRef.current.playAsync();
          return;
        }

        setIsLoading(true);
        setCurrentUrl(url);
        setIsPaused(false);

        // Stop any existing sound before loading a new one
        const previous = soundRef.current;
        soundRef.current = null;
        if (previous) {
          isCleaningUp.current = true;
          try {
            await unloadSoundInstance(previous);
          } finally {
            isCleaningUp.current = false;
          }
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        soundRef.current = sound;
      } catch (e: any) {
        console.error('[AudioProvider] Failed to play audio', e);
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);

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
    },
    [onPlaybackStatusUpdate]
  );

  const pauseAudio = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } catch (e) {
      console.warn('[AudioProvider] Failed to pause audio', e);
    }
  }, []);

  const togglePlayPause = useCallback(
    async (url: string) => {
      if (isPlaying) {
        await pauseAudio();
      } else {
        await playAudio(url);
      }
    },
    [isPlaying, pauseAudio, playAudio]
  );

  return (
    <AudioContext.Provider
      value={{
        playAudio,
        pauseAudio,
        stopAudio,
        togglePlayPause,
        isPlaying,
        isPaused,
        isLoading,
        currentUrl,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
