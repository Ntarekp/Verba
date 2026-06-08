export interface Phonetic {
  text: string;
  audio: string;
  sourceUrl?: string;
}

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  origin?: string;
  sourceUrls: string[];
}

export interface SearchHistoryItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definitionSummary: string;
  timestamp: number;
}

export interface SavedWordItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionSummary: string;
  timestamp: number;
  collection: 'Favorites' | 'Academic' | 'Travel';
  masteryLevel: 1 | 2 | 3;
  learningNotes?: string;
  audioUrl?: string;
  exampleSentence?: string;
}
