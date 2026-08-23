import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Note, NoteVersion } from '@/src/types/note';
import {
  initDatabase,
  getNotesFromDb,
  saveNoteToDb,
  softDeleteNoteInDb,
  addVersionSnapshotToNoteInDb,
  getNoteByIdFromDb,
} from '@/src/services/db';
import { useSyncStore } from './useSyncStore';
import { useSettingsStore } from './useSettingsStore';

export interface ConflictData {
  localNote: Note;
  remoteNote: Note;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  conflictData: ConflictData | null;

  // Actions
  init: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  saveNote: (title: string, body: string, id?: string) => Promise<string>;
  deleteNote: (id: string) => Promise<void>;
  restoreVersion: (noteId: string, version: NoteVersion) => Promise<void>;
  simulateConflict: (id: string) => Promise<void>;
  resolveConflict: (choice: 'keep_mine' | 'keep_remote' | 'merge') => Promise<void>;
  clearConflict: () => void;
}

function generateId(): string {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: true,
  conflictData: null,

  init: async () => {
    try {
      set({ isLoading: true });
      await initDatabase();
      await useSettingsStore.getState().initSettings();
      await get().fetchNotes();
      await useSyncStore.getState().checkNetwork();

      if (useSettingsStore.getState().autoSyncEnabled) {
        await useSyncStore.getState().syncNow();
      }
    } catch (error) {
      console.error('[NoteStore] Initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotes: async () => {
    try {
      const notes = await getNotesFromDb();
      set({ notes });
      await useSyncStore.getState().checkNetwork();
    } catch (error) {
      console.error('[NoteStore] Fetch notes error:', error);
    }
  },

  saveNote: async (title: string, body: string, id?: string): Promise<string> => {
    const now = new Date().toISOString();
    const cleanTitle = title.trim() || 'Untitled Note';
    const cleanBody = body.trim();
    const noteId = id || generateId();

    const existingNote = id ? await getNoteByIdFromDb(id) : null;
    const createdAt = existingNote ? existingNote.created_at : now;

    // Build new version history snapshot if content changed meaningfully
    const currentVersions = existingNote ? existingNote.version_history || [] : [];
    let updatedVersions = currentVersions;

    if (!existingNote || existingNote.body !== cleanBody || existingNote.title !== cleanTitle) {
      const newSnapshot: NoteVersion = {
        id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: cleanTitle,
        body: cleanBody,
        timestamp: now,
      };
      updatedVersions = [newSnapshot, ...currentVersions].slice(0, 20);
    }

    const noteToSave: Note = {
      id: noteId,
      title: cleanTitle,
      body: cleanBody,
      created_at: createdAt,
      updated_at: now,
      is_synced: false,
      is_deleted: false,
      version_history: updatedVersions,
    };

    await saveNoteToDb(noteToSave);
    await get().fetchNotes();

    // Trigger subtle haptic feedback on save
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Haptics unavailable on some emulators
    }

    // Auto sync if enabled
    if (useSettingsStore.getState().autoSyncEnabled) {
      useSyncStore.getState().syncNow();
    }

    return noteId;
  },

  deleteNote: async (id: string) => {
    await softDeleteNoteInDb(id);
    await get().fetchNotes();

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics fallback
    }

    if (useSettingsStore.getState().autoSyncEnabled) {
      useSyncStore.getState().syncNow();
    }
  },

  restoreVersion: async (noteId: string, version: NoteVersion) => {
    const existing = await getNoteByIdFromDb(noteId);
    if (!existing) return;

    await get().saveNote(version.title, version.body, noteId);
  },

  simulateConflict: async (id: string) => {
    const local = await getNoteByIdFromDb(id);
    if (!local) return;

    const fakeRemote: Note = {
      ...local,
      title: local.title + ' (Remote Version)',
      body: local.body + '\n\n[Remote Server Addition: Synced version with extra updates]',
      updated_at: new Date().toISOString(),
      is_synced: true,
    };

    set({ conflictData: { localNote: local, remoteNote: fakeRemote } });
  },

  resolveConflict: async (choice: 'keep_mine' | 'keep_remote' | 'merge') => {
    const conflict = get().conflictData;
    if (!conflict) return;

    const { localNote, remoteNote } = conflict;
    let finalTitle = localNote.title;
    let finalBody = localNote.body;

    if (choice === 'keep_remote') {
      finalTitle = remoteNote.title;
      finalBody = remoteNote.body;
    } else if (choice === 'merge') {
      finalTitle = localNote.title;
      finalBody = `${localNote.body}\n\n--- MERGED REMOTE VERSION ---\n${remoteNote.body}`;
    }

    await get().saveNote(finalTitle, finalBody, localNote.id);
    set({ conflictData: null });

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
  },

  clearConflict: () => {
    set({ conflictData: null });
  },
}));
