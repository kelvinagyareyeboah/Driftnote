import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';

export const ConflictResolutionModal: React.FC = () => {
  const conflictData = useNoteStore((state) => state.conflictData);
  const resolveConflict = useNoteStore((state) => state.resolveConflict);
  const clearConflict = useNoteStore((state) => state.clearConflict);
  const themeMode = useSettingsStore((state) => state.themeMode);

  if (!conflictData) return null;

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const { localNote, remoteNote } = conflictData;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={clearConflict}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Sync Conflict Detected
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Local edits conflict with the remote version. Select how you want to resolve this note:
          </Text>

          <ScrollView style={styles.diffContainer}>
            <View style={[styles.versionBox, { borderColor: theme.surfaceBorder }]}>
              <Text style={[styles.versionHeader, { color: theme.accent }]}>
                📱 Local Version (Your Edits)
              </Text>
              <Text style={[styles.versionTitle, { color: theme.textPrimary }]}>
                {localNote.title}
              </Text>
              <Text
                style={[styles.versionBody, { color: theme.textSecondary }]}
                numberOfLines={3}
              >
                {localNote.body}
              </Text>
            </View>

            <View style={[styles.versionBox, { borderColor: theme.surfaceBorder }]}>
              <Text style={[styles.versionHeader, { color: theme.pending }]}>
                ☁️ Remote Synced Version
              </Text>
              <Text style={[styles.versionTitle, { color: theme.textPrimary }]}>
                {remoteNote.title}
              </Text>
              <Text
                style={[styles.versionBody, { color: theme.textSecondary }]}
                numberOfLines={3}
              >
                {remoteNote.body}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.accent }]}
              onPress={() => resolveConflict('keep_mine')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Keep Mine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceBorder }]}
              onPress={() => resolveConflict('keep_remote')}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                Keep Synced Version
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.accentMuted, borderColor: theme.accent, borderWidth: 1 },
              ]}
              onPress={() => resolveConflict('merge')}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, { color: theme.accent }]}>
                Merge Both Versions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  diffContainer: {
    maxHeight: 240,
    marginBottom: 20,
  },
  versionBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  versionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  versionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  versionBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsColumn: {
    gap: 10,
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
