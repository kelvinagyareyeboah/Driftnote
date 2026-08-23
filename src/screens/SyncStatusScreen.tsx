import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { SyncDot } from '@/src/components/SyncDot';
import { formatRelativeTime } from '@/src/components/NoteCard';
import { Note } from '@/src/types/note';

export const SyncStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const isOnline = useSyncStore((state) => state.isOnline);
  const syncStatus = useSyncStore((state) => state.syncStatus);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const unsyncedNotes = useSyncStore((state) => state.unsyncedNotes);
  const syncNow = useSyncStore((state) => state.syncNow);
  const retrySingleNote = useSyncStore((state) => state.retrySingleNote);
  const checkNetwork = useSyncStore((state) => state.checkNetwork);

  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    checkNetwork();
  }, []);

  const handleSyncAll = async () => {
    await syncNow();
    await useNoteStore.getState().fetchNotes();
  };

  const handleRetryNote = async (id: string) => {
    await retrySingleNote(id);
    await useNoteStore.getState().fetchNotes();
  };

  const renderUnsyncedItem = ({ item }: { item: Note }) => (
    <View
      style={[
        styles.pendingCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
    >
      <View style={styles.pendingInfo}>
        <View style={styles.titleRow}>
          <SyncDot isSynced={false} isOnline={isOnline} size={8} />
          <Text
            style={[styles.pendingTitle, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {item.title || 'Untitled Note'}
          </Text>
        </View>
        <Text style={[styles.pendingTime, { color: theme.textMuted }]}>
          Updated {formatRelativeTime(item.updated_at)}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.retryBtn,
          {
            backgroundColor: isOnline ? theme.accent : theme.surfaceBorder,
          },
        ]}
        onPress={() => handleRetryNote(item.id)}
        disabled={!isOnline || isSyncing}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.retryBtnText,
            { color: isOnline ? '#FFFFFF' : theme.textMuted },
          ]}
        >
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Sync Status
        </Text>
      </View>

      {/* Prominent Connection Banner */}
      <View style={styles.bannerContainer}>
        <View
          style={[
            styles.connectionBanner,
            {
              backgroundColor: !isOnline
                ? theme.offlineMuted
                : unsyncedNotes.length > 0
                ? theme.pendingMuted
                : theme.accentMuted,
              borderColor: !isOnline
                ? theme.offline
                : unsyncedNotes.length > 0
                ? theme.pending
                : theme.accent,
            },
          ]}
        >
          <View style={styles.bannerRow}>
            <View style={styles.bannerTextCol}>
              <View style={styles.bannerStatusRow}>
                <SyncDot isSynced={syncStatus === 'Synced'} isOnline={isOnline} size={10} />
                <Text
                  style={[
                    styles.bannerStatusTitle,
                    {
                      color: !isOnline
                        ? theme.offline
                        : unsyncedNotes.length > 0
                        ? theme.pending
                        : theme.accent,
                    },
                  ]}
                >
                  {!isOnline
                    ? 'Device Offline'
                    : unsyncedNotes.length > 0
                    ? 'Pending Synchronization'
                    : 'All Notes Synced'}
                </Text>
              </View>

              <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                {!isOnline
                  ? 'Your edits are saved locally to SQLite and queued.'
                  : unsyncedNotes.length > 0
                  ? `${unsyncedNotes.length} note(s) waiting to sync.`
                  : 'Your local database is fully up to date.'}
              </Text>

              {lastSyncedAt && (
                <Text style={[styles.timestampText, { color: theme.textMuted }]}>
                  Last successful sync: {formatRelativeTime(lastSyncedAt)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Manual Sync Now Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.syncNowBtn,
            {
              backgroundColor: isOnline ? theme.accent : theme.surfaceBorder,
            },
          ]}
          onPress={handleSyncAll}
          disabled={!isOnline || isSyncing}
          activeOpacity={0.85}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : null}
          <Text
            style={[
              styles.syncNowBtnText,
              { color: isOnline ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pending Sync Queue Section */}
      <View style={styles.queueHeader}>
        <Text style={[styles.queueTitle, { color: theme.textPrimary }]}>
          Pending Queue ({unsyncedNotes.length})
        </Text>
      </View>

      <FlatList
        data={unsyncedNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderUnsyncedItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 90, 100) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyQueue}>
            <Text style={styles.emptyQueueIcon}>✅</Text>
            <Text style={[styles.emptyQueueTitle, { color: theme.textPrimary }]}>
              Queue is empty
            </Text>
            <Text style={[styles.emptyQueueSub, { color: theme.textMuted }]}>
              No unsynced edits pending. Everything is saved safely locally.
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  connectionBanner: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerStatusTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  syncNowBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncNowBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  queueHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  pendingCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  pendingTime: {
    fontSize: 12,
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyQueue: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyQueueIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyQueueTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyQueueSub: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
