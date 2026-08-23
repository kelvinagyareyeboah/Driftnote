import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { formatRelativeTime } from '@/src/components/NoteCard';
import { NoteVersion } from '@/src/types/note';

export const VersionHistoryScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const noteId = params.id;

  const notes = useNoteStore((state) => state.notes);
  const restoreVersion = useNoteStore((state) => state.restoreVersion);
  const themeMode = useSettingsStore((state) => state.themeMode);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const note = notes.find((n) => n.id === noteId);

  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Note not found
        </Text>
      </View>
    );
  }

  const versions = note.version_history || [];

  const handleRestore = (version: NoteVersion) => {
    Alert.alert(
      'Restore Version',
      `Are you sure you want to restore the snapshot from ${formatRelativeTime(version.timestamp)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await restoreVersion(note.id, version);
            router.back();
          },
        },
      ]
    );
  };

  const renderVersionItem = ({ item, index }: { item: NoteVersion; index: number }) => {
    const isSelected = selectedVersion?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.versionCard,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? theme.accent : theme.surfaceBorder,
          },
        ]}
        onPress={() => setSelectedVersion(item)}
        activeOpacity={0.7}
      >
        <View style={styles.versionCardHeader}>
          <Text style={[styles.versionIndexText, { color: theme.accent }]}>
            {index === 0 ? 'Current Version' : `Snapshot #${versions.length - index}`}
          </Text>
          <Text style={[styles.versionTime, { color: theme.textMuted }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>

        <Text style={[styles.versionTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title || 'Untitled Snapshot'}
        </Text>

        <Text style={[styles.versionBody, { color: theme.textSecondary }]} numberOfLines={3}>
          {item.body || 'Empty content'}
        </Text>

        <TouchableOpacity
          style={[styles.restoreBtn, { backgroundColor: theme.accent }]}
          onPress={() => handleRestore(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.restoreBtnText}>Restore This Snapshot</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.surfaceBorder,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backBtnText, { color: theme.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Version History
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.noteMetaHeader}>
        <Text style={[styles.metaTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={[styles.metaCount, { color: theme.textMuted }]}>
          {versions.length} saved snapshot(s) in SQLite
        </Text>
      </View>

      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        renderItem={renderVersionItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 30, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No previous version snapshots recorded yet.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  noteMetaHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  versionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  versionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  versionIndexText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  versionTime: {
    fontSize: 12,
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  versionBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  restoreBtn: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
