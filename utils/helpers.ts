
import { SongData, SongPlatform } from '../types';

export const parseSongUrl = (url: string): SongData | null => {
  try {
    // Regex yang lebih kuat untuk berbagai format YouTube (shorts, mobile, embed, standard)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const spotifyRegex = /spotify\.com\/track\/([a-zA-Z0-9]+)/;

    const ytMatch = url.match(youtubeRegex);
    if (ytMatch && ytMatch[1]) {
      return {
        url,
        platform: 'YouTube',
        id: ytMatch[1],
        title: 'Loading YouTube...',
        artist: 'YouTube'
      };
    }

    const spMatch = url.match(spotifyRegex);
    if (spMatch && spMatch[1]) {
      return {
        url,
        platform: 'Spotify',
        id: spMatch[1],
        title: 'Loading Spotify...',
        artist: 'Spotify'
      };
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const sanitizeId = (id: string, platform: SongPlatform): string => {
  if (!id) return '';
  const cleanId = id.trim().split(/[?&#\s]/)[0];
  
  if (platform === 'YouTube') {
    return cleanId.length === 11 ? cleanId : '';
  }
  return cleanId;
};

export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  return new Date(timestamp).toLocaleDateString();
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
