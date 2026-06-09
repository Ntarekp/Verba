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
  replayAudio: () => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  prefetchAudio: (url: string) => Promise<void>;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentUrl: string | null;
  positionMillis: number;
  durationMillis: number;
  playbackRate: number;
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
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isCleaningUp = useRef(false);
  const isPausedRef = useRef(false);
  const currentUrlRef = useRef<string | null>(null);
  const playbackRateRef = useRef(1);

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
      setPositionMillis(status.positionMillis ?? 0);
      setDurationMillis(status.durationMillis ?? 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
        if (status.durationMillis) {
          setPositionMillis(status.durationMillis);
        }
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
    setPositionMillis(0);
    setDurationMillis(0);

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
        setPositionMillis(0);
        setDurationMillis(0);

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

        if (playbackRateRef.current !== 1) {
          try {
            await sound.setRateAsync(playbackRateRef.current, true);
          } catch (e) {
            console.warn('[AudioProvider] Failed to apply playback rate', e);
          }
        }
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

  const replayAudio = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        if (!status.isPlaying) {
          await sound.playAsync();
        }
        setPositionMillis(0);
        setIsPaused(false);
      }
    } catch (e) {
      console.warn('[AudioProvider] Failed to replay audio', e);
      const url = currentUrlRef.current;
      if (url) {
        await playAudio(url);
      }
    }
  }, [playAudio]);

  const setPlaybackRate = useCallback(async (rate: number) => {
    const clamped = Math.max(0.5, Math.min(2, rate));
    playbackRateRef.current = clamped;
    setPlaybackRateState(clamped);

    const sound = soundRef.current;
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setRateAsync(clamped, true);
      }
    } catch (e) {
      console.warn('[AudioProvider] Failed to set playback rate', e);
    }
  }, []);

  const prefetchAudio = useCallback(async (url: string) => {
    if (!url) return;
    try {
      await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false }
      );
    } catch (e) {
      console.warn('[AudioProvider] Prefetch failed', e);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        playAudio,
        pauseAudio,
        stopAudio,
        togglePlayPause,
        replayAudio,
        setPlaybackRate,
        prefetchAudio,
        isPlaying,
        isPaused,
        isLoading,
        currentUrl,
        positionMillis,
        durationMillis,
        playbackRate,
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
