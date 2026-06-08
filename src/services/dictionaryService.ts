import api from './api';
import { parseApiResponse } from '../utils/apiParser';
import { DictionaryEntry } from '../models/DictionaryTypes';

export const lookupWord = async (word: string): Promise<DictionaryEntry> => {
  try {
    const formattedWord = word.trim().toLowerCase();
    if (!formattedWord) {
      throw new Error('EMPTY_QUERY');
    }
    const response = await api.get(`/${encodeURIComponent(formattedWord)}`);
    return parseApiResponse(response.data);
  } catch (error: any) {
    if (error.message === 'EMPTY_QUERY' || error.message === 'EMPTY_RESPONSE') {
      throw error;
    }
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('WORD_NOT_FOUND');
      }
      throw new Error('SERVER_ERROR');
    } else if (error.request) {
      throw new Error('NETWORK_TIMEOUT');
    } else {
      throw new Error('UNKNOWN_ERROR');
    }
  }
};
