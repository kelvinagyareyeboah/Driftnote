import { create } from 'zustand';
import { Note, SyncStatus } from '@/src/types/note';
import {
  checkIsOnline,
  syncNotesStub,
  syncSingleNoteStub,
  getLastSyncedTimestamp,
} from '@/src/services/network';
import { getUnsyncedNotesFromDb } from '@/src/services/db';

interface SyncState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  unsyncedNotes: Note[];

  // Actions
  checkNetwork: () => Promise<void>;
  syncNow: () => Promise<void>;
  retrySingleNote: (id: string) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: true,
  syncStatus: 'Synced',
  isSyncing: false,
  lastSyncedAt: null,
  unsyncedNotes: [],

  checkNetwork: async () => {
    const isOnline = await checkIsOnline();
    const unsynced = await getUnsyncedNotesFromDb();
    const lastSynced = getLastSyncedTimestamp();

    let syncStatus: SyncStatus = 'Synced';
    if (!isOnline) {
      syncStatus = 'Offline';
    } else if (unsynced.length > 0) {
      syncStatus = 'Pending sync';
    }

    set({
      isOnline,
      unsyncedNotes: unsynced,
      syncStatus,
      lastSyncedAt: lastSynced || get().lastSyncedAt,
    });
  },

  syncNow: async () => {
    const isOnline = await checkIsOnline();
    if (!isOnline) {
      set({ isOnline: false, syncStatus: 'Offline' });
      return;
    }

    set({ isSyncing: true, syncStatus: 'Pending sync' });
    const result = await syncNotesStub();
    const unsyncedAfter = await getUnsyncedNotesFromDb();

    set({
      isSyncing: false,
      isOnline: true,
      lastSyncedAt: result.timestamp,
      unsyncedNotes: unsyncedAfter,
      syncStatus: unsyncedAfter.length > 0 ? 'Pending sync' : 'Synced',
    });
  },

  retrySingleNote: async (id: string) => {
    const isOnline = await checkIsOnline();
    if (!isOnline) return;

    set({ isSyncing: true });
    await syncSingleNoteStub(id);
    const unsyncedAfter = await getUnsyncedNotesFromDb();

    set({
      isSyncing: false,
      unsyncedNotes: unsyncedAfter,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: unsyncedAfter.length > 0 ? 'Pending sync' : 'Synced',
    });
  },
}));
