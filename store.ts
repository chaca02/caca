
import { ConfessMessage, SongMode, SongData, UserAccount } from './types';

const MESSAGES_KEY = 'ilikeu_messages_v2';
const USER_KEY = 'ilikeu_current_user';
const SONG_MODE_KEY = 'ilikeu_song_mode';

export const getMessages = (): ConfessMessage[] => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getMessagesForUser = (username: string): ConfessMessage[] => {
  const all = getMessages();
  return all.filter(m => m.targetUsername.toLowerCase() === username.toLowerCase());
};

export const saveMessage = (msg: ConfessMessage) => {
  const messages = getMessages();
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([msg, ...messages]));
};

export const deleteMessage = (id: string) => {
  const messages = getMessages();
  const updated = messages.filter(m => m.id !== id);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

export const toggleBookmark = (id: string) => {
  const messages = getMessages();
  const updated = messages.map(m => {
    if (m.id === id) {
      return { ...m, isBookmarked: !m.isBookmarked };
    }
    return m;
  });
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

export const addReply = (messageId: string, content: string, song?: SongData) => {
  const messages = getMessages();
  const updated = messages.map(m => {
    if (m.id === messageId) {
      return {
        ...m,
        replies: [
          {
            id: Math.random().toString(36).substr(2, 9),
            content,
            timestamp: Date.now(),
            song: song
          },
          ...m.replies
        ]
      };
    }
    return m;
  });
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

// Akun Management
export const registerUser = (username: string) => {
  const user: UserAccount = { username, createdAt: Date.now() };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): UserAccount | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
};

export const deleteAccount = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Added missing functions used in SendPage
 */
export const getGlobalSongMode = (): SongMode => {
  const stored = localStorage.getItem(SONG_MODE_KEY);
  return (stored as SongMode) || 'OPSIONAL';
};

export const setGlobalSongMode = (mode: SongMode) => {
  localStorage.setItem(SONG_MODE_KEY, mode);
};
