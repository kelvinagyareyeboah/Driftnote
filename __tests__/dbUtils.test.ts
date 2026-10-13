import { parseVersionHistory, mapRowToNote } from '../src/services/db';
import { NoteRow } from '../src/types/note';

describe('Database Utility Functions', () => {
  describe('parseVersionHistory', () => {
    it('returns empty array when input is null, undefined, or empty string', () => {
      expect(parseVersionHistory(null)).toEqual([]);
      expect(parseVersionHistory(undefined)).toEqual([]);
      expect(parseVersionHistory('')).toEqual([]);
    });

    it('successfully parses valid JSON version history array', () => {
      const mockHistory = [
        {
          id: 'v_1',
          title: 'Initial Title',
          body: 'First draft',
          timestamp: '2026-10-01T00:00:00.000Z',
        },
      ];
      const json = JSON.stringify(mockHistory);
      expect(parseVersionHistory(json)).toEqual(mockHistory);
    });

    it('safely catches malformed JSON and returns empty array without throwing', () => {
      const malformedJson = '{"brokenJson: true,';
      expect(parseVersionHistory(malformedJson)).toEqual([]);
    });

    it('returns empty array when JSON parses to a non-array object', () => {
      const nonArrayJson = JSON.stringify({ key: 'value' });
      expect(parseVersionHistory(nonArrayJson)).toEqual([]);
    });
  });

  describe('mapRowToNote', () => {
    it('accurately maps SQLite integer booleans and JSON columns to Note object', () => {
      const row: NoteRow = {
        id: 'note_abc',
        title: 'Project Roadmap',
        body: 'Launch beta in Q4',
        created_at: '2026-10-01T12:00:00.000Z',
        updated_at: '2026-10-01T14:30:00.000Z',
        is_synced: 1,
        is_deleted: 0,
        version_history: '[]',
      };

      const note = mapRowToNote(row);
      expect(note.id).toBe('note_abc');
      expect(note.title).toBe('Project Roadmap');
      expect(note.body).toBe('Launch beta in Q4');
      expect(note.is_synced).toBe(true);
      expect(note.is_deleted).toBe(false);
      expect(note.version_history).toEqual([]);
    });

    it('falls back to updated_at when created_at is falsy in older DB schemas', () => {
      const row: NoteRow = {
        id: 'note_legacy',
        title: 'Legacy Note',
        body: 'Pre-migration data',
        created_at: '',
        updated_at: '2026-09-01T08:00:00.000Z',
        is_synced: 0,
        is_deleted: 0,
        version_history: '[]',
      };

      const note = mapRowToNote(row);
      expect(note.created_at).toBe('2026-09-01T08:00:00.000Z');
      expect(note.is_synced).toBe(false);
    });
  });
});
