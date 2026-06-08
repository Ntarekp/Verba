import { SuggestionItem } from '../components/SearchSuggestionsPanel';

export const SUGGESTION_BANK: SuggestionItem[] = [
  { word: 'luminescence', partOfSpeech: 'noun' },
  { word: 'luminous', partOfSpeech: 'adjective' },
  { word: 'luminary', partOfSpeech: 'noun' },
  { word: 'ephemeral', partOfSpeech: 'adjective' },
  { word: 'ethereal', partOfSpeech: 'adjective' },
  { word: 'ubiquitous', partOfSpeech: 'adjective' },
  { word: 'mellifluous', partOfSpeech: 'adjective' },
  { word: 'eloquent', partOfSpeech: 'adjective' },
  { word: 'audacious', partOfSpeech: 'adjective' },
  { word: 'enigma', partOfSpeech: 'noun' },
  { word: 'resilience', partOfSpeech: 'noun' },
  { word: 'empathy', partOfSpeech: 'noun' },
  { word: 'paradigm', partOfSpeech: 'noun' },
  { word: 'sycophant', partOfSpeech: 'noun' },
  { word: 'solitude', partOfSpeech: 'noun' },
  { word: 'serendipity', partOfSpeech: 'noun' },
];

export function filterSuggestions(query: string): SuggestionItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  return SUGGESTION_BANK.filter((item) => {
    const word = item.word.toLowerCase();
    return word.includes(q) && word !== q;
  }).sort((a, b) => {
    const aIdx = a.word.toLowerCase().indexOf(q);
    const bIdx = b.word.toLowerCase().indexOf(q);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.word.localeCompare(b.word);
  });
}
