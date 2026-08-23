import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';

export const SyncStatusIndicator: React.FC = () => {
  const syncStatus = useSyncStore((state) => state.syncStatus);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const checkNetwork = useSyncStore((state) => state.checkNetwork);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const getStatusStyles = () => {
    switch (syncStatus) {
      case 'Synced':
        return {
          container: { backgroundColor: theme.accentMuted, borderColor: theme.accent },
          dot: { backgroundColor: theme.accent },
          text: { color: theme.accent },
        };
      case 'Pending sync':
        return {
          container: { backgroundColor: theme.pendingMuted, borderColor: theme.pending },
          dot: { backgroundColor: theme.pending },
          text: { color: theme.pending },
        };
      case 'Offline':
        return {
          container: { backgroundColor: theme.offlineMuted, borderColor: theme.offline },
          dot: { backgroundColor: theme.offline },
          text: { color: theme.offline },
        };
      default:
        return {
          container: { backgroundColor: theme.accentMuted, borderColor: theme.accent },
          dot: { backgroundColor: theme.accent },
          text: { color: theme.accent },
        };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <TouchableOpacity
      style={[styles.badgeContainer, statusStyle.container]}
      onPress={checkNetwork}
      activeOpacity={0.7}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={theme.pending} style={styles.spinner} />
      ) : (
        <View style={[styles.dot, statusStyle.dot]} />
      )}
      <Text style={[styles.statusText, statusStyle.text]}>
        {isSyncing ? 'Syncing...' : syncStatus}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  spinner: {
    marginRight: 6,
    transform: [{ scale: 0.7 }],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
