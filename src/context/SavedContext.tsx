import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedWordItem } from '../models/DictionaryTypes';

interface SavedContextProps {
  savedWords: SavedWordItem[];
  addSavedWord: (
    word: string, 
    phonetic: string, 
    partOfSpeech: string, 
    definitionSummary: string, 
    collection?: 'Favorites' | 'Academic' | 'Travel'
  ) => Promise<void>;
  removeSavedWord: (word: string) => Promise<void>;
  updateWordNotes: (word: string, notes: string) => Promise<void>;
  updateWordMastery: (word: string, level: 1 | 2 | 3) => Promise<void>;
  streakCount: number;
  incrementStreak: () => Promise<void>;
  isLoading: boolean;
}

const SavedContext = createContext<SavedContextProps | undefined>(undefined);

const SAVED_KEY = 'verba_saved_vocabulary';
const STREAK_KEY = 'verba_streak_data';

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedWords, setSavedWords] = useState<SavedWordItem[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawSaved = await AsyncStorage.getItem(SAVED_KEY);
        if (rawSaved) {
          setSavedWords(JSON.parse(rawSaved));
        }

        const rawStreak = await AsyncStorage.getItem(STREAK_KEY);
        if (rawStreak) {
          const parsed = JSON.parse(rawStreak);
          
          // Validate and check if streak is broken
          const todayStr = getLocalDateString(new Date());
          const lastStr = parsed.lastLookupDate;
          
          if (lastStr === todayStr) {
            setStreakCount(parsed.streakCount || 0);
          } else {
            const lastDate = new Date(lastStr);
            const todayDate = new Date(todayStr);
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
              setStreakCount(parsed.streakCount || 0);
            } else {
              // Streak broken! Reset to 0 (or 1 on next search)
              setStreakCount(0);
              await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({
                streakCount: 0,
                lastLookupDate: todayStr
              }));
            }
          }
        } else {
          // Initialize streak data — starts at 0 (no searches yet)
          const todayStr = getLocalDateString(new Date());
          setStreakCount(0);
          await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({
            streakCount: 0,
            lastLookupDate: todayStr
          }));
        }
      } catch (e) {
        console.error('Failed to load saved words and streak', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getLocalDateString = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  };

  const addSavedWord = async (
    word: string, 
    phonetic: string, 
    partOfSpeech: string, 
    definitionSummary: string,
    collection: 'Favorites' | 'Academic' | 'Travel' = 'Favorites'
  ) => {
    try {
      const alreadySaved = savedWords.find(
        (item) => item.word.toLowerCase() === word.toLowerCase()
      );

      if (alreadySaved) return;

      const newItem: SavedWordItem = {
        word,
        phonetic,
        partOfSpeech,
        definitionSummary,
        timestamp: Date.now(),
        collection,
        masteryLevel: 1, // Start at mastery level 1
        learningNotes: '',
      };

      const updated = [newItem, ...savedWords];
      setSavedWords(updated);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      await incrementStreak();
    } catch (e) {
      console.error('Failed to save word', e);
    }
  };

  const removeSavedWord = async (word: string) => {
    try {
      const updated = savedWords.filter(
        (item) => item.word.toLowerCase() !== word.toLowerCase()
      );
      setSavedWords(updated);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove saved word', e);
    }
  };

  const updateWordNotes = async (word: string, notes: string) => {
    try {
      const updated = savedWords.map((item) => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          return { ...item, learningNotes: notes };
        }
        return item;
      });
      setSavedWords(updated);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update word notes', e);
    }
  };

  const updateWordMastery = async (word: string, level: 1 | 2 | 3) => {
    try {
      const updated = savedWords.map((item) => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          return { ...item, masteryLevel: level };
        }
        return item;
      });
      setSavedWords(updated);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update word mastery', e);
    }
  };

  const incrementStreak = async () => {
    try {
      const todayStr = getLocalDateString(new Date());
      const rawStreak = await AsyncStorage.getItem(STREAK_KEY);
      
      let currentStreak = 1;
      let lastDate = todayStr;

      if (rawStreak) {
        const parsed = JSON.parse(rawStreak);
        lastDate = parsed.lastLookupDate;
        currentStreak = parsed.streakCount || 0;

        if (lastDate !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = getLocalDateString(yesterday);

          if (lastDate === yesterdayStr) {
            currentStreak += 1;
          } else {
            currentStreak = 1; // Streak broken, reset
          }
        }
      }

      setStreakCount(currentStreak);
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({
        streakCount: currentStreak,
        lastLookupDate: todayStr
      }));
    } catch (e) {
      console.error('Failed to update streak count', e);
    }
  };

  return (
    <SavedContext.Provider value={{
      savedWords,
      addSavedWord,
      removeSavedWord,
      updateWordNotes,
      updateWordMastery,
      streakCount,
      incrementStreak,
      isLoading
    }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
