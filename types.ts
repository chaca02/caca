
export type SongPlatform = 'YouTube' | 'Spotify';

export interface SongData {
  url: string;
  platform: SongPlatform;
  id: string;
  title?: string;
  artist?: string;
  startTime?: number; // In seconds
}

export interface Reply {
  id: string;
  content: string;
  timestamp: number;
  song?: SongData;
}

export interface ConfessMessage {
  id: string;
  targetUsername: string; // Nama akun tujuan (Secreto-style)
  receiver: string;       // Nama panggilan di pesan
  sender?: string;        // Nama pengirim (opsional)
  content: string;
  timestamp: number;
  song?: SongData;
  replies: Reply[];
  isBookmarked?: boolean; // Fitur simpan/bookmark
}

export type SongMode = 'WAJIB' | 'OPSIONAL';

export interface UserAccount {
  username: string;
  createdAt: number;
}
