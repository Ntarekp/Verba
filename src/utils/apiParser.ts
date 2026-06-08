import { DictionaryEntry, Phonetic, Meaning } from '../models/DictionaryTypes';

export const parseApiResponse = (data: any[]): DictionaryEntry => {
  if (!data || data.length === 0) {
    throw new Error('EMPTY_RESPONSE');
  }

  const raw = data[0]; // Take primary entry
  
  // Find first non-empty phonetic spelling text (e.g. /ɪˈθɪəriəl/)
  const textPhonetic = raw.phonetic || 
    raw.phonetics?.find((p: any) => p.text && p.text.trim().length > 0)?.text || '';
    
  // Filter phonetics containing valid audio streams, ensuring we format the URLs properly
  const validPhonetics: Phonetic[] = (raw.phonetics || [])
    .filter((p: any) => p.audio && p.audio.trim().length > 0)
    .map((p: any) => {
      // Fix potential API anomalies where audio URLs lack protocol (e.g., //ssl.gstatic.com/...)
      let audioUrl = p.audio.trim();
      if (audioUrl.startsWith('//')) {
        audioUrl = 'https:' + audioUrl;
      }
      return {
        text: p.text || textPhonetic,
        audio: audioUrl,
        sourceUrl: p.sourceUrl,
      };
    });

  const structuredMeanings: Meaning[] = (raw.meanings || []).map((m: any) => ({
    partOfSpeech: m.partOfSpeech || 'unknown',
    definitions: (m.definitions || []).map((d: any) => ({
      definition: d.definition || '',
      synonyms: d.synonyms || [],
      antonyms: d.antonyms || [],
      example: d.example || undefined,
    })),
    synonyms: m.synonyms || [],
    antonyms: m.antonyms || [],
  }));

  return {
    word: raw.word || '',
    phonetic: textPhonetic,
    phonetics: validPhonetics,
    meanings: structuredMeanings,
    origin: raw.origin || undefined,
    sourceUrls: raw.sourceUrls || [],
  };
};
