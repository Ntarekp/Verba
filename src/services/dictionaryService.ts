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
      const status = error.response.status;
      if (status === 404) {
        throw new Error('WORD_NOT_FOUND');
      }
      if (status === 503 || status === 504) {
        throw new Error('SERVER_TIMEOUT');
      }
      if (status >= 500) {
        throw new Error('SERVER_ERROR');
      }
      throw new Error('CONNECTION_ERROR');
    }
    if (error.request) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('NETWORK_TIMEOUT');
      }
      throw new Error('NETWORK_OFFLINE');
    }
    throw new Error('UNKNOWN_ERROR');
  }
};
