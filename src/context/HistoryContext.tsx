import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchHistoryItem } from '../models/DictionaryTypes';

interface HistoryContextProps {
  history: SearchHistoryItem[];
  addHistoryWord: (word: string, partOfSpeech: string, definitionSummary: string) => Promise<void>;
  deleteHistoryWord: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextProps | undefined>(undefined);

const HISTORY_KEY = 'verba_history';
const MAX_HISTORY_ITEMS = 100;

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) {
          setHistory(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  const addHistoryWord = async (word: string, partOfSpeech: string, definitionSummary: string) => {
    try {
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        word,
        partOfSpeech,
        definitionSummary,
        timestamp: Date.now(),
      };

      // Filter out duplicate entries of the same word (case insensitive)
      let updated = history.filter(
        (item) => item.word.toLowerCase() !== word.toLowerCase()
      );

      // Add new item to top
      updated.unshift(newItem);

      // Truncate list if exceeds limit
      if (updated.length > MAX_HISTORY_ITEMS) {
        updated = updated.slice(0, MAX_HISTORY_ITEMS);
      }

      setHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add word to history', e);
    }
  };

  const deleteHistoryWord = async (id: string) => {
    try {
      const updated = history.filter((item) => item.id !== id);
      setHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete history item', e);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear search history', e);
    }
  };

  return (
    <HistoryContext.Provider value={{
      history,
      addHistoryWord,
      deleteHistoryWord,
      clearHistory,
      isLoading
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
