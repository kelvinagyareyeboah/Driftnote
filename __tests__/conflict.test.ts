import {
  hasConflict,
  resolveNoteConflict,
  ConflictResolutionChoice,
} from '../src/services/conflict';
import { Note } from '../src/types/note';

describe('Conflict Detection Engine', () => {
  const baseLocalNote: Note = {
    id: 'note_123',
    title: 'Architecture Review',
    body: 'Discussing local-first SQLite sync',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:05:00.000Z',
    is_synced: false,
    is_deleted: false,
    version_history: [],
  };

  it('detects no conflict when notes have identical title and body', () => {
    const remoteNote: Note = {
      ...baseLocalNote,
      updated_at: '2026-10-01T10:06:00.000Z',
      is_synced: true,
    };
    expect(hasConflict(baseLocalNote, remoteNote)).toBe(false);
  });

  it('detects conflict when titles differ', () => {
    const remoteNote: Note = {
      ...baseLocalNote,
      title: 'Architecture Review (Updated by Remote)',
    };
    expect(hasConflict(baseLocalNote, remoteNote)).toBe(true);
  });

  it('detects conflict when body contents diverge', () => {
    const remoteNote: Note = {
      ...baseLocalNote,
      body: 'Discussing local-first SQLite sync + CRDT algorithms',
    };
    expect(hasConflict(baseLocalNote, remoteNote)).toBe(true);
  });

  it('returns false if note IDs do not match (different resources)', () => {
    const differentNote: Note = {
      ...baseLocalNote,
      id: 'note_456',
      title: 'Different Note',
    };
    expect(hasConflict(baseLocalNote, differentNote)).toBe(false);
  });
});

describe('3-Way Conflict Resolution Strategies', () => {
  const local = {
    title: 'Sprint Planning (Local)',
    body: 'Task A: Fix SQLite debounce\nTask B: Add haptics',
  };

  const remote = {
    title: 'Sprint Planning (Remote)',
    body: 'Task A: Deploy backend to Render\nTask C: Vercel SPA routing',
  };

  const timestamp = '2026-10-13T01:50:00.000Z';

  it('correctly resolves via "keep_mine" (Client-Wins)', () => {
    const result = resolveNoteConflict('keep_mine', local, remote, timestamp);
    expect(result.title).toBe(local.title);
    expect(result.body).toBe(local.body);
    expect(result.resolvedAt).toBe(timestamp);
  });

  it('correctly resolves via "keep_remote" (Server-Wins)', () => {
    const result = resolveNoteConflict('keep_remote', local, remote, timestamp);
    expect(result.title).toBe(remote.title);
    expect(result.body).toBe(remote.body);
    expect(result.resolvedAt).toBe(timestamp);
  });

  it('correctly executes non-destructive "merge" strategy', () => {
    const result = resolveNoteConflict('merge', local, remote, timestamp);
    expect(result.title).toBe(`${local.title} / ${remote.title}`);
    expect(result.body).toContain(local.body);
    expect(result.body).toContain('--- MERGED REMOTE VERSION ---');
    expect(result.body).toContain(remote.body);
    expect(result.resolvedAt).toBe(timestamp);
  });

  it('preserves single title when merging notes with identical titles', () => {
    const identicalTitleLocal = { ...local, title: 'Team Sync' };
    const identicalTitleRemote = { ...remote, title: 'Team Sync' };

    const result = resolveNoteConflict('merge', identicalTitleLocal, identicalTitleRemote, timestamp);
    expect(result.title).toBe('Team Sync');
    expect(result.body).toContain('--- MERGED REMOTE VERSION ---');
  });

  it('gracefully handles empty local or remote bodies', () => {
    const emptyLocal = { title: 'Untitled', body: '' };
    const remoteContent = { title: 'Untitled', body: 'Important remote text' };

    const result = resolveNoteConflict('merge', emptyLocal, remoteContent, timestamp);
    expect(result.title).toBe('Untitled');
    expect(result.body).toContain('Important remote text');
  });
});
