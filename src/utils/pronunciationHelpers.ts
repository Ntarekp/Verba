import { DictionaryEntry, Phonetic } from '../models/DictionaryTypes';

/** Derive a human-readable accent label from the audio URL or phonetic text. */
export function getAccentLabel(phonetic: Phonetic): string {
  const url = phonetic.audio?.toLowerCase() || '';
  if (url.includes('-us') || url.includes('_us') || url.includes('/en-us')) {
    return '🇺🇸 American';
  }
  if (url.includes('-uk') || url.includes('_uk') || url.includes('/en-gb')) {
    return '🇬🇧 British';
  }
  if (url.includes('-au') || url.includes('_au')) {
    return '🇦🇺 Australian';
  }
  if (phonetic.text) {
    return phonetic.text;
  }
  return '🔊 Standard';
}

/** Short accent label for compact segmented controls. */
export function getAccentShortLabel(phonetic: Phonetic): string {
  const url = phonetic.audio?.toLowerCase() || '';
  if (url.includes('-us') || url.includes('_us') || url.includes('/en-us')) {
    return 'American';
  }
  if (url.includes('-uk') || url.includes('_uk') || url.includes('/en-gb')) {
    return 'British';
  }
  if (url.includes('-au') || url.includes('_au')) {
    return 'Australian';
  }
  return phonetic.text || 'Standard';
}

export function getValidPhonetics(entry: DictionaryEntry): Phonetic[] {
  return entry.phonetics.filter((p) => p.audio && p.audio.trim().length > 0);
}

export interface RelatedWordGroup {
  synonyms: string[];
  antonyms: string[];
}

export function buildRelatedWords(entry: DictionaryEntry, meaningIndex?: number): RelatedWordGroup {
  const normalizeAndLimit = (items: string[], limit = 8) =>
    Array.from(new Map(items.map((s) => [s.toLowerCase(), s])).values()).slice(0, limit);

  let allSyns: string[] = [];
  let allAnts: string[] = [];

  if (meaningIndex !== undefined && entry.meanings[meaningIndex]) {
    const m = entry.meanings[meaningIndex];
    allSyns = [
      ...(m.synonyms || []),
      ...m.definitions.flatMap((d) => d.synonyms || []),
    ];
    allAnts = [
      ...(m.antonyms || []),
      ...m.definitions.flatMap((d) => d.antonyms || []),
    ];
  } else {
    allSyns = entry.meanings.flatMap((m) => [
      ...(m.synonyms || []),
      ...m.definitions.flatMap((d) => d.synonyms || []),
    ]);
    allAnts = entry.meanings.flatMap((m) => [
      ...(m.antonyms || []),
      ...m.definitions.flatMap((d) => d.antonyms || []),
    ]);
  }

  const synonyms = normalizeAndLimit(allSyns);
  const antonyms = normalizeAndLimit(allAnts);

  return { synonyms, antonyms };
}

export interface PronunciationTip {
  id: string;
  label: string;
  icon?: 'stress' | 'schwa' | 'aspiration' | 'info';
}

/** Heuristic pronunciation tips derived from IPA text (no API). */
export function buildPronunciationTips(
  phoneticText: string,
  word: string
): PronunciationTip[] {
  const tips: PronunciationTip[] = [];
  const ipa = phoneticText || '';

  const stressMatch = ipa.match(/ˈ([^·\s/]+)/);
  if (stressMatch) {
    tips.push({
      id: 'stress',
      label: `Stressed Syllable: '${stressMatch[1].slice(0, 4)}'`,
      icon: 'stress',
    });
  }

  if (ipa.includes('ə')) {
    tips.push({
      id: 'schwa',
      label: 'Clear Schwa: /ə/',
      icon: 'schwa',
    });
  }

  if (/k(?=[aeiou])/i.test(word) || ipa.includes('k')) {
    tips.push({
      id: 'aspiration',
      label: "Aspirated 'k'",
      icon: 'aspiration',
    });
  }

  if (tips.length === 0 && ipa) {
    tips.push({
      id: 'listen',
      label: 'Listen and repeat slowly',
      icon: 'info',
    });
  }

  return tips.slice(0, 4);
}

export function formatMillis(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
