import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/src/types/note';

const SETTINGS_KEY = '@driftnote_settings';

interface SettingsState {
  themeMode: ThemeMode;
  autoSyncEnabled: boolean;
  wifiOnlyEnabled: boolean;
  recentSearches: string[];

  // Actions
  initSettings: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleAutoSync: () => Promise<void>;
  toggleWifiOnly: () => Promise<void>;
  addRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeMode: 'light',
  autoSyncEnabled: true,
  wifiOnlyEnabled: false,
  recentSearches: [],

  initSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          themeMode: parsed.themeMode || 'light',
          autoSyncEnabled: parsed.autoSyncEnabled ?? true,
          wifiOnlyEnabled: parsed.wifiOnlyEnabled ?? false,
          recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
        });
      }
    } catch (e) {
      console.warn('[SettingsStore] Failed to load settings:', e);
    }
  },

  toggleTheme: async () => {
    const nextTheme: ThemeMode = get().themeMode === 'light' ? 'dark' : 'light';
    await get().setThemeMode(nextTheme);
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          themeMode: mode,
          autoSyncEnabled: current.autoSyncEnabled,
          wifiOnlyEnabled: current.wifiOnlyEnabled,
          recentSearches: current.recentSearches,
        })
      );
    } catch (e) {
      console.warn('[SettingsStore] Failed to save settings:', e);
    }
  },

  toggleAutoSync: async () => {
    const nextVal = !get().autoSyncEnabled;
    set({ autoSyncEnabled: nextVal });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...current, autoSyncEnabled: nextVal })
      );
    } catch (e) {
      console.warn('[SettingsStore] Failed to save settings:', e);
    }
  },

  toggleWifiOnly: async () => {
    const nextVal = !get().wifiOnlyEnabled;
    set({ wifiOnlyEnabled: nextVal });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...current, wifiOnlyEnabled: nextVal })
      );
    } catch (e) {
      console.warn('[SettingsStore] Failed to save settings:', e);
    }
  },

  addRecentSearch: async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = get().recentSearches;
    const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 5); // Keep top 5 recent searches
    set({ recentSearches: updated });
    try {
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...get(), recentSearches: updated })
      );
    } catch (e) {
      console.warn('[SettingsStore] Failed to save settings:', e);
    }
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    try {
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...get(), recentSearches: [] })
      );
    } catch (e) {
      console.warn('[SettingsStore] Failed to save settings:', e);
    }
  },
}));
