import { Note } from '@/src/types/note';

export type ConflictResolutionChoice = 'keep_mine' | 'keep_remote' | 'merge';

export interface ConflictResolutionResult {
  title: string;
  body: string;
  resolvedAt: string;
}

/**
 * Deterministically checks whether two versions of a note conflict.
 * A conflict occurs when remote has different content from local and both have edits.
 */
export function hasConflict(localNote: Note, remoteNote: Note): boolean {
  if (localNote.id !== remoteNote.id) {
    return false;
  }
  return localNote.title !== remoteNote.title || localNote.body !== remoteNote.body;
}

/**
 * Resolves a 3-way conflict between a local edit and a remote server version.
 * - 'keep_mine': Retains the client's local draft.
 * - 'keep_remote': Overwrites with the remote server version.
 * - 'merge': Non-destructively joins both versions with explicit separator markers.
 */
export function resolveNoteConflict(
  choice: ConflictResolutionChoice,
  localNote: Pick<Note, 'title' | 'body'>,
  remoteNote: Pick<Note, 'title' | 'body'>,
  timestamp: string = new Date().toISOString()
): ConflictResolutionResult {
  switch (choice) {
    case 'keep_remote':
      return {
        title: remoteNote.title,
        body: remoteNote.body,
        resolvedAt: timestamp,
      };

    case 'merge': {
      const mergedTitle =
        localNote.title === remoteNote.title
          ? localNote.title
          : `${localNote.title} / ${remoteNote.title}`;

      const mergedBody = [
        localNote.body,
        '',
        '--- MERGED REMOTE VERSION ---',
        remoteNote.body,
      ].join('\n');

      return {
        title: mergedTitle,
        body: mergedBody,
        resolvedAt: timestamp,
      };
    }

    case 'keep_mine':
    default:
      return {
        title: localNote.title,
        body: localNote.body,
        resolvedAt: timestamp,
      };
  }
}
