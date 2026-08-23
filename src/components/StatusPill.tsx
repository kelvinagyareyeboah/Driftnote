import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { SyncDot } from './SyncDot';

interface StatusPillProps {
  status: 'Saving...' | 'Saved locally' | 'Synced' | 'Offline';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const isSaving = status === 'Saving...';
  const isSynced = status === 'Synced';
  const isOffline = status === 'Offline';

  let bgColor = theme.accentMuted;
  let textColor = theme.accent;

  if (isOffline) {
    bgColor = theme.offlineMuted;
    textColor = theme.offline;
  } else if (!isSynced && !isSaving) {
    bgColor = theme.pendingMuted;
    textColor = theme.pending;
  }

  return (
    <View style={[styles.pill, { backgroundColor: bgColor }]}>
      {isSaving ? (
        <ActivityIndicator size="small" color={textColor} style={styles.spinner} />
      ) : (
        <SyncDot isSynced={isSynced} isOnline={!isOffline} size={7} />
      )}
      <Text style={[styles.pillText, { color: textColor }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spinner: {
    marginRight: 6,
    transform: [{ scale: 0.65 }],
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
