import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

export const getCachedHoroscope = (key: string): string | undefined => {
  return cache.get(key);
};

export const setCachedHoroscope = (key: string, value: string): void => {
  cache.set(key, value);
};