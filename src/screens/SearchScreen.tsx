import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { useSyncStore } from '@/src/store/useSyncStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { NoteCard } from '@/src/components/NoteCard';
import { SyncStateFilter } from '@/src/types/note';

const FILTERS: SyncStateFilter[] = ['All', 'Synced', 'Pending', 'Offline'];

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notes = useNoteStore((state) => state.notes);
  const isOnline = useSyncStore((state) => state.isOnline);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const recentSearches = useSettingsStore((state) => state.recentSearches);
  const addRecentSearch = useSettingsStore((state) => state.addRecentSearch);
  const clearRecentSearches = useSettingsStore((state) => state.clearRecentSearches);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SyncStateFilter>('All');

  const filteredNotes = notes.filter((n) => {
    // Filter by text search
    const matchesSearch =
      !query.trim() ||
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by Sync state chip
    if (activeFilter === 'Synced') return n.is_synced && isOnline;
    if (activeFilter === 'Pending') return !n.is_synced && isOnline;
    if (activeFilter === 'Offline') return !isOnline || !n.is_synced;
    return true;
  });

  const handleSelectRecentSearch = (selected: string) => {
    setQuery(selected);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Search
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            },
          ]}
          placeholder="Search titles or body content..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterChipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Recent Searches (when query is empty) */}
      {!query && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: theme.textMuted }]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.7}>
              <Text style={[styles.clearRecentText, { color: theme.accent }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentChipsWrap}>
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.recentChip,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                  },
                ]}
                onPress={() => handleSelectRecentSearch(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.recentChipText, { color: theme.textSecondary }]}>
                  🔍 {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Feed */}
      <FlatList
        data={filteredNotes}
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
        ListEmptyComponent={
          <View style={styles.emptyResults}>
            <Text style={[styles.emptyResultsTitle, { color: theme.textSecondary }]}>
              No matching notes found
            </Text>
            <Text style={[styles.emptyResultsSub, { color: theme.textMuted }]}>
              Try searching for a different keyword or changing the filter chip.
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  filterChipsRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clearRecentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyResultsSub: {
    fontSize: 13,
    textAlign: 'center',
  },
});
