export const isValidSearchQuery = (raw: string): boolean => {
  if (!raw || typeof raw !== 'string') return false;
  const s = raw.trim();
  if (s.length === 0) return false;
  // Allow unicode letters, spaces and hyphens only (reject punctuation like .,'" etc.)
  // e.g. allow: "self-aware", "naïve"
  const re = /^[\p{L}\- ]+$/u;
  return re.test(s);
};

export const normalizeSearchQuery = (raw: string): string => raw.trim();
