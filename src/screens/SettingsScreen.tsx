import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { setHasCompletedOnboarding } from '@/src/services/storage';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const themeMode = useSettingsStore((state) => state.themeMode);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const autoSyncEnabled = useSettingsStore((state) => state.autoSyncEnabled);
  const toggleAutoSync = useSettingsStore((state) => state.toggleAutoSync);
  const wifiOnlyEnabled = useSettingsStore((state) => state.wifiOnlyEnabled);
  const toggleWifiOnly = useSettingsStore((state) => state.toggleWifiOnly);

  const notes = useNoteStore((state) => state.notes);
  const simulateConflict = useNoteStore((state) => state.simulateConflict);
  const unsyncedNotes = useSyncStore((state) => state.unsyncedNotes);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const handleSimulateConflict = async () => {
    if (notes.length === 0) {
      Alert.alert(
        'No Notes',
        'Please create at least one note first to simulate a conflict.'
      );
      return;
    }
    const targetNote = notes[0];
    await simulateConflict(targetNote.id);
    router.push('/(tabs)' as any);
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Driftnote?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth' as any);
        },
      },
    ]);
  };

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
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 90, 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 0: Account & Security Profile */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          ACCOUNT & PROFILE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.accentMuted }]}>
              <Text style={[styles.avatarText, { color: theme.accent }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                {user?.name || 'Local Account'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {user?.email || 'demo@driftnote.app'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <Text style={[styles.signOutBtnText, { color: theme.danger }]}>
              Sign Out of Driftnote
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                {themeMode === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.surfaceBorder, true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section 2: Sync Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          SYNC PREFERENCES
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowTextGroup}>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>
                Auto-Sync Edits
              </Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                Push changes immediately when online
              </Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={toggleAutoSync}
              trackColor={{ false: theme.surfaceBorder, true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <View style={styles.row}>
            <View style={styles.rowTextGroup}>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>
                Wi-Fi Only Sync
              </Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                Restrict background sync to Wi-Fi connections
              </Text>
            </View>
            <Switch
              value={wifiOnlyEnabled}
              onValueChange={toggleWifiOnly}
              trackColor={{ false: theme.surfaceBorder, true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section 3: Local Storage Info */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          STORAGE & METRICS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Notes Stored Locally (SQLite)
            </Text>
            <Text style={[styles.infoValue, { color: theme.accent }]}>
              {notes.length}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Unsynced / Pending Notes
            </Text>
            <Text style={[styles.infoValue, { color: theme.pending }]}>
              {unsyncedNotes.length}
            </Text>
          </View>
        </View>

        {/* Section 4: Conflict Testing & Features */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          DEMOS & GUIDES
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={async () => {
              await setHasCompletedOnboarding(false);
              router.push('/onboarding' as any);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.demoBtnText, { color: theme.accent }]}>
              📖 View Feature Onboarding Slides
            </Text>
            <Text style={[styles.rowSub, { color: theme.textSecondary, marginTop: 2 }]}>
              View feature overview slides on offline storage & sync architecture
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => router.push('/splash' as any)}
            activeOpacity={0.75}
          >
            <Text style={[styles.demoBtnText, { color: theme.accent }]}>
              ✨ Replay Animated Splash Screen
            </Text>
            <Text style={[styles.rowSub, { color: theme.textSecondary, marginTop: 2 }]}>
              Plays the brand animated splash sequence
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleSimulateConflict}
            activeOpacity={0.75}
          >
            <Text style={[styles.demoBtnText, { color: theme.accent }]}>
              ⚡ Simulate Sync Conflict Modal
            </Text>
            <Text style={[styles.rowSub, { color: theme.textSecondary, marginTop: 2 }]}>
              Tests the 3-way conflict resolution UI ("Keep mine", "Keep remote", "Merge")
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: About Info */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ABOUT</Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={styles.aboutRow}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Driftnote</Text>
            <Text style={[styles.rowSub, { color: theme.textMuted }]}>v1.0.0-PROD</Text>
          </View>
          <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
            Offline-First Local Note Architecture built with React Native (Expo SDK 54), SQLite, and Zustand state synchronization.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  signOutBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  demoBtn: {
    paddingVertical: 4,
  },
  demoBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
});
