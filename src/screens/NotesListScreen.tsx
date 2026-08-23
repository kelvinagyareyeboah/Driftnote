import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { NoteCard } from '@/src/components/NoteCard';
import { SyncDot } from '@/src/components/SyncDot';
import { ConflictResolutionModal } from '@/src/components/ConflictResolutionModal';

export const NotesListScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notes = useNoteStore((state) => state.notes);
  const isLoading = useNoteStore((state) => state.isLoading);
  const syncNow = useSyncStore((state) => state.syncNow);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const isOnline = useSyncStore((state) => state.isOnline);
  const syncStatus = useSyncStore((state) => state.syncStatus);
  const themeMode = useSettingsStore((state) => state.themeMode);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncNow();
    await useNoteStore.getState().fetchNotes();
    setRefreshing(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <ConflictResolutionModal />

      {/* Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.surfaceBorder,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Driftnote
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            All Notes ({notes.length})
          </Text>
        </View>

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={[styles.guideBtn, { backgroundColor: theme.accentMuted }]}
            onPress={() => router.push('/onboarding' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.guideBtnText, { color: theme.accent }]}>Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.syncStatusBadge,
              { backgroundColor: theme.surfaceBorder },
            ]}
            onPress={() => router.push('/(tabs)/sync')}
            activeOpacity={0.7}
          >
            <SyncDot isSynced={syncStatus === 'Synced'} isOnline={isOnline} size={7} />
            <Text style={[styles.syncBadgeText, { color: theme.textSecondary }]}>
              {isSyncing ? 'Syncing...' : syncStatus}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Note Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.accentMuted }]}>
            <Text style={styles.emptyIconText}>📓</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Your notes live here
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Create your first note offline or online. Your work is saved automatically to local SQLite.
          </Text>
          <TouchableOpacity
            style={[styles.createFirstBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/editor')}
            activeOpacity={0.85}
          >
            <Text style={styles.createFirstBtnText}>Create First Note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => router.push({ pathname: '/editor', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 90, 100) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push('/editor')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  guideBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createFirstBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 34,
  },
});
