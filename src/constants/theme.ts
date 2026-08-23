import { Platform } from 'react-native';

export const Palette = {
  // Brand Accent (Calm Electric Cyan/Blue) - tied directly to "Synced" state
  accentLight: '#0284C7',
  accentDark: '#38BDF8',
  accentMutedLight: '#E0F2FE',
  accentMutedDark: '#075985',

  // Sync state colors
  synced: '#0284C7', // Matches accent color!
  pending: '#D97706',
  pendingMutedLight: '#FEF3C7',
  pendingMutedDark: '#78350F',
  offline: '#64748B',
  offlineMutedLight: '#F1F5F9',
  offlineMutedDark: '#1E293B',

  // Light Mode neutral palette (Minimalist Apple / Craft style)
  bgLight: '#F8FAFC',
  surfaceLight: '#FFFFFF',
  surfaceBorderLight: '#E2E8F0',
  textPrimaryLight: '#0F172A',
  textSecondaryLight: '#334155',
  textMutedLight: '#64748B',

  // Dark Mode neutral palette (Deep slate/near-black)
  bgDark: '#0B0F17',
  surfaceDark: '#161E2E',
  surfaceBorderDark: '#26334D',
  textPrimaryDark: '#F8FAFC',
  textSecondaryDark: '#94A3B8',
  textMutedDark: '#64748B',

  // Action / Danger
  danger: '#EF4444',
  dangerMutedLight: '#FEE2E2',
  dangerMutedDark: '#7F1D1D',
};

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  synced: string;
  pending: string;
  pendingMuted: string;
  offline: string;
  offlineMuted: string;
  danger: string;
  dangerMuted: string;
}

export const lightTheme: ThemeTokens = {
  background: Palette.bgLight,
  surface: Palette.surfaceLight,
  surfaceBorder: Palette.surfaceBorderLight,
  textPrimary: Palette.textPrimaryLight,
  textSecondary: Palette.textSecondaryLight,
  textMuted: Palette.textMutedLight,
  accent: Palette.accentLight,
  accentMuted: Palette.accentMutedLight,
  synced: Palette.synced,
  pending: Palette.pending,
  pendingMuted: Palette.pendingMutedLight,
  offline: Palette.offline,
  offlineMuted: Palette.offlineMutedLight,
  danger: Palette.danger,
  dangerMuted: Palette.dangerMutedLight,
};

export const darkTheme: ThemeTokens = {
  background: Palette.bgDark,
  surface: Palette.surfaceDark,
  surfaceBorder: Palette.surfaceBorderDark,
  textPrimary: Palette.textPrimaryDark,
  textSecondary: Palette.textSecondaryDark,
  textMuted: Palette.textMutedDark,
  accent: Palette.accentDark,
  accentMuted: Palette.accentMutedDark,
  synced: Palette.synced,
  pending: Palette.pending,
  pendingMuted: Palette.pendingMutedDark,
  offline: Palette.offline,
  offlineMuted: Palette.offlineMutedDark,
  danger: Palette.danger,
  dangerMuted: Palette.dangerMutedLight,
};

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const Typography = {
  fontFamily,
  header: {
    fontFamily,
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 23,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
};
