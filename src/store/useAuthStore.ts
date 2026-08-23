import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@driftnote_auth';

export interface UserProfile {
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isPinLocked: boolean;
  pinCode: string | null;
  isLocked: boolean;
  isLoading: boolean;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, name?: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  setPinCode: (pin: string | null) => Promise<void>;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isPinLocked: false,
  pinCode: null,
  isLocked: false,
  isLoading: true,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          isAuthenticated: Boolean(parsed.isAuthenticated),
          user: parsed.user || null,
          isPinLocked: Boolean(parsed.isPinLocked),
          pinCode: parsed.pinCode || null,
          isLocked: Boolean(parsed.isPinLocked),
        });
      }
    } catch (e) {
      console.warn('[AuthStore] Failed to initialize auth state:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, name?: string) => {
    const userProfile: UserProfile = {
      email,
      name: name || email.split('@')[0] || 'Driftnote User',
    };
    const newState = {
      isAuthenticated: true,
      user: userProfile,
      isLocked: false,
    };

    set(newState);
    try {
      const current = get();
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          user: userProfile,
          isPinLocked: current.isPinLocked,
          pinCode: current.pinCode,
        })
      );
    } catch (e) {
      console.warn('[AuthStore] Failed to save auth state:', e);
    }
  },

  register: async (name: string, email: string) => {
    await get().login(email, name);
  },

  logout: async () => {
    set({
      isAuthenticated: false,
      user: null,
      isLocked: false,
    });
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('[AuthStore] Failed to clear auth state:', e);
    }
  },

  setPinCode: async (pin: string | null) => {
    const isPinLocked = Boolean(pin);
    set({ pinCode: pin, isPinLocked });
    try {
      const current = get();
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: current.isAuthenticated,
          user: current.user,
          isPinLocked,
          pinCode: pin,
        })
      );
    } catch (e) {
      console.warn('[AuthStore] Failed to save pin code:', e);
    }
  },

  unlockWithPin: (pin: string): boolean => {
    const currentPin = get().pinCode;
    if (!currentPin || pin === currentPin) {
      set({ isLocked: false });
      return true;
    }
    return false;
  },

  lockApp: () => {
    if (get().isPinLocked) {
      set({ isLocked: true });
    }
  },
}));
