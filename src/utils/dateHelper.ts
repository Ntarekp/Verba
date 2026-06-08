import { SearchHistoryItem } from '../models/DictionaryTypes';

export interface GroupedHistory {
  title: 'Recent' | 'Yesterday' | 'Older';
  data: SearchHistoryItem[];
}

export const groupHistoryByDate = (items: SearchHistoryItem[]): GroupedHistory[] => {
  const recent: SearchHistoryItem[] = [];
  const yesterday: SearchHistoryItem[] = [];
  const older: SearchHistoryItem[] = [];

  const now = new Date();
  
  // Set start of today to 00:00:00.000 local time
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Start of yesterday is 24 hours prior
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  items.forEach((item) => {
    if (item.timestamp >= startOfToday) {
      recent.push(item);
    } else if (item.timestamp >= startOfYesterday) {
      yesterday.push(item);
    } else {
      older.push(item);
    }
  });

  const result: GroupedHistory[] = [];
  if (recent.length > 0) result.push({ title: 'Recent', data: recent });
  if (yesterday.length > 0) result.push({ title: 'Yesterday', data: yesterday });
  if (older.length > 0) result.push({ title: 'Older', data: older });

  return result;
};
