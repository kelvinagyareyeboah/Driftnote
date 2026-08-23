import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { StatusPill } from '@/src/components/StatusPill';

export const NoteEditorScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const noteId = params.id;

  const notes = useNoteStore((state) => state.notes);
  const saveNote = useNoteStore((state) => state.saveNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const isOnline = useSyncStore((state) => state.isOnline);
  const themeMode = useSettingsStore((state) => state.themeMode);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const existingNote = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState(existingNote ? existingNote.title : '');
  const [body, setBody] = useState(existingNote ? existingNote.body : '');
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>(noteId);
  const [status, setStatus] = useState<'Saving...' | 'Saved locally' | 'Synced' | 'Offline'>(
    !isOnline ? 'Offline' : existingNote?.is_synced ? 'Synced' : 'Saved locally'
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  // Sync effect for existing note updates
  useEffect(() => {
    if (existingNote && isFirstMount.current) {
      setTitle(existingNote.title);
      setBody(existingNote.body);
      isFirstMount.current = false;
    }
  }, [existingNote]);

  // Debounced autosave
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!title.trim() && !body.trim()) return;

    setStatus('Saving...');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const savedId = await saveNote(title, body, activeNoteId);
        if (!activeNoteId) {
          setActiveNoteId(savedId);
        }

        if (!isOnline) {
          setStatus('Offline');
        } else {
          setStatus(useSettingsStore.getState().autoSyncEnabled ? 'Synced' : 'Saved locally');
        }
      } catch (error) {
        console.error('[Editor] Autosave error:', error);
        setStatus('Saved locally');
      }
    }, 750); // 750ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [title, body]);

  const handleDelete = () => {
    if (!activeNoteId) {
      router.back();
      return;
    }

    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(activeNoteId);
          router.back();
        },
      },
    ]);
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Navigation Bar */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.surfaceBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnText, { color: theme.accent }]}>‹ Back</Text>
          </TouchableOpacity>

          <StatusPill status={status} />

          <View style={styles.headerRightActions}>
            {activeNoteId && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push({ pathname: '/history', params: { id: activeNoteId } })}
                activeOpacity={0.7}
              >
                <Text style={[styles.historyText, { color: theme.accent }]}>History</Text>
              </TouchableOpacity>
            )}

            {activeNoteId && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteText, { color: theme.danger }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Text Editors */}
        <ScrollView
          contentContainerStyle={styles.editorContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.titleInput, { color: theme.textPrimary }]}
            placeholder="Note Title"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={140}
          />

          <TextInput
            style={[styles.bodyInput, { color: theme.textSecondary }]}
            placeholder="Start typing your thoughts..."
            placeholderTextColor={theme.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Footer info bar */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.surfaceBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {body.length} characters
          </Text>
          <Text style={[styles.footerStatus, { color: theme.textSecondary }]}>
            {isOnline ? 'SQLite Persistent' : 'Offline Mode'}
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    paddingVertical: 4,
  },
  historyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editorContent: {
    padding: 24,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    paddingVertical: 4,
    letterSpacing: -0.5,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
    minHeight: 320,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});
