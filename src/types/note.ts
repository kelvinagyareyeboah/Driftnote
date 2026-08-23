export interface NoteVersion {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_synced: boolean;
  is_deleted: boolean;
  version_history: NoteVersion[];
}

export interface NoteRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
  is_deleted: number;
  version_history: string;
}

export type SyncStatus = 'Synced' | 'Pending sync' | 'Offline';
export type SyncStateFilter = 'All' | 'Synced' | 'Pending' | 'Offline';
export type ThemeMode = 'light' | 'dark';
