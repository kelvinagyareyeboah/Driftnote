import * as SQLite from 'expo-sqlite';
import { Note, NoteRow, NoteVersion } from '@/src/types/note';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('driftnote.db');
  }
  return dbInstance;
}

function parseVersionHistory(rawJson: string | null | undefined): NoteVersion[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[DB] Failed to parse version_history JSON:', e);
    return [];
  }
}

function mapRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    created_at: row.created_at || row.updated_at,
    updated_at: row.updated_at,
    is_synced: Boolean(row.is_synced),
    is_deleted: Boolean(row.is_deleted),
    version_history: parseVersionHistory(row.version_history),
  };
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL,
      is_synced INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      version_history TEXT NOT NULL DEFAULT '[]'
    );
  `);

  // Migration checks for columns in existing databases
  try {
    await db.execAsync(`ALTER TABLE notes ADD COLUMN created_at TEXT;`);
  } catch (e) {
    // Column already exists
  }
  try {
    await db.execAsync(`ALTER TABLE notes ADD COLUMN version_history TEXT NOT NULL DEFAULT '[]';`);
  } catch (e) {
    // Column already exists
  }
}

export async function getNotesFromDb(): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<NoteRow>(
    'SELECT * FROM notes WHERE is_deleted = 0 ORDER BY updated_at DESC'
  );
  return rows.map(mapRowToNote);
}

export async function getNoteByIdFromDb(id: string): Promise<Note | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<NoteRow>(
    'SELECT * FROM notes WHERE id = ?',
    [id]
  );
  return row ? mapRowToNote(row) : null;
}

export async function saveNoteToDb(note: Note): Promise<void> {
  const db = await getDb();
  const versionHistoryJson = JSON.stringify(note.version_history || []);

  await db.runAsync(
    `INSERT OR REPLACE INTO notes (id, title, body, created_at, updated_at, is_synced, is_deleted, version_history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      note.body,
      note.created_at,
      note.updated_at,
      note.is_synced ? 1 : 0,
      note.is_deleted ? 1 : 0,
      versionHistoryJson,
    ]
  );
}

export async function softDeleteNoteInDb(id: string): Promise<void> {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE notes SET is_deleted = 1, is_synced = 0, updated_at = ? WHERE id = ?',
    [updatedAt, id]
  );
}

export async function getUnsyncedNotesFromDb(): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<NoteRow>(
    'SELECT * FROM notes WHERE is_synced = 0'
  );
  return rows.map(mapRowToNote);
}

export async function markNotesSyncedInDb(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE notes SET is_synced = 1 WHERE id IN (${placeholders})`,
    ids
  );
}

export async function addVersionSnapshotToNoteInDb(
  id: string,
  title: string,
  body: string
): Promise<void> {
  const note = await getNoteByIdFromDb(id);
  if (!note) return;

  const newSnapshot: NoteVersion = {
    id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title,
    body,
    timestamp: new Date().toISOString(),
  };

  const updatedHistory = [newSnapshot, ...(note.version_history || [])].slice(0, 20); // Keep last 20 snapshots
  note.version_history = updatedHistory;
  await saveNoteToDb(note);
}
