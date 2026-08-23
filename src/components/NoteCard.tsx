import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Note } from '@/src/types/note';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { useSyncStore } from '@/src/store/useSyncStore';
import { lightTheme, darkTheme, Typography } from '@/src/constants/theme';
import { SyncDot } from './SyncDot';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMins = Math.floor(diffInSeconds / 60);
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const isOnline = useSyncStore((state) => state.isOnline);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const wordCount = note.body.trim() ? note.body.trim().split(/\s+/).length : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <Text
          style={[styles.title, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {note.title || 'Untitled Note'}
        </Text>
        <SyncDot isSynced={note.is_synced} isOnline={isOnline} size={8} />
      </View>

      <Text
        style={[styles.snippet, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {note.body || 'Empty note...'}
      </Text>

      <View style={styles.footerRow}>
        <Text style={[styles.time, { color: theme.textMuted }]}>
          {formatRelativeTime(note.updated_at)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.wordCount, { color: theme.textMuted }]}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </Text>
          {note.version_history && note.version_history.length > 0 && (
            <Text style={[styles.versionBadge, { color: theme.accent, backgroundColor: theme.accentMuted }]}>
              {note.version_history.length} v
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  snippet: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
  wordCount: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
  },
  versionBadge: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
