import * as Network from 'expo-network';
import { getUnsyncedNotesFromDb, markNotesSyncedInDb, getNoteByIdFromDb } from './db';

let lastSyncedTimestamp: string | null = null;

export function getLastSyncedTimestamp(): string | null {
  return lastSyncedTimestamp;
}

export async function checkIsOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  } catch (error) {
    console.warn('[Network] Failed to check network state:', error);
    return false;
  }
}

export async function syncNotesStub(): Promise<{
  syncedCount: number;
  success: boolean;
  timestamp: string;
}> {
  const isOnline = await checkIsOnline();
  const now = new Date().toISOString();

  if (!isOnline) {
    console.log('[Sync] Device is offline. Skipping sync.');
    return { syncedCount: 0, success: false, timestamp: now };
  }

  const unsyncedNotes = await getUnsyncedNotesFromDb();
  if (unsyncedNotes.length === 0) {
    console.log('[Sync] No unsynced notes found.');
    lastSyncedTimestamp = now;
    return { syncedCount: 0, success: true, timestamp: now };
  }

  console.log(`[Sync] Syncing ${unsyncedNotes.length} unsynced note(s) to server stub:`, unsyncedNotes);
  await new Promise((resolve) => setTimeout(resolve, 400));

  const syncedIds = unsyncedNotes.map((note) => note.id);
  await markNotesSyncedInDb(syncedIds);
  lastSyncedTimestamp = now;

  console.log(`[Sync] Marked ${syncedIds.length} note(s) as synced in SQLite.`);
  return { syncedCount: syncedIds.length, success: true, timestamp: now };
}

export async function syncSingleNoteStub(id: string): Promise<boolean> {
  const isOnline = await checkIsOnline();
  if (!isOnline) return false;

  const note = await getNoteByIdFromDb(id);
  if (!note) return false;

  console.log(`[Sync] Retrying sync for single note ${id}:`, note.title);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await markNotesSyncedInDb([id]);
  lastSyncedTimestamp = new Date().toISOString();
  return true;
}
