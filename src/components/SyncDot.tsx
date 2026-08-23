import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';

interface SyncDotProps {
  isSynced: boolean;
  isOnline?: boolean;
  size?: number;
}

export const SyncDot: React.FC<SyncDotProps> = ({ isSynced, isOnline = true, size = 8 }) => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  let dotColor = theme.synced; // Green/Teal accent!
  if (!isOnline) {
    dotColor = theme.offline;
  } else if (!isSynced) {
    dotColor = theme.pending;
  }

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    marginRight: 6,
  },
});
