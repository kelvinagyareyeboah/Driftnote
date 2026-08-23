import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setHasCompletedOnboarding } from '@/src/services/storage';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '📱',
    badge: 'LOCAL-FIRST ARCHITECTURE',
    title: 'Notes that never lose your work',
    subtitle: '100% Offline-First SQLite Database',
    description:
      'Every keystroke is written directly to a high-speed SQLite database on your device. Write anywhere with zero latency and zero dependency on network signal.',
  },
  {
    id: '2',
    icon: '⚡',
    badge: 'SMART BACKGROUND SYNC',
    title: 'Automatic background synchronization',
    subtitle: 'Zero manual configuration required',
    description:
      'When offline, edits are queued safely with pending status. As soon as your internet connection is restored, Driftnote syncs your notes in the background.',
  },
  {
    id: '3',
    icon: '🔒',
    badge: 'MINIMAL & FOCUSED',
    title: 'Clean, distraction-free note taking',
    subtitle: 'Built for speed and privacy',
    description:
      'No clutter, no heavy UI bloatware. Designed with clean typography and instant debounced autosave so you can focus entirely on your thoughts.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = SLIDES[currentIndex];

  const handleFinish = async () => {
    await setHasCompletedOnboarding(true);
    router.replace('/(tabs)' as any);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.headerBrand, { color: theme.textPrimary }]}>
            Driftnote
          </Text>
          <View style={[styles.versionPill, { backgroundColor: theme.accentMuted }]}>
            <Text style={[styles.versionPillText, { color: theme.accent }]}>
              v1.0
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleFinish} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: theme.textMuted }]}>
            {currentIndex < SLIDES.length - 1 ? 'Skip' : 'Close'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bars */}
      <View style={styles.progressRow}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBarTrack,
              { backgroundColor: theme.surfaceBorder },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor:
                    index <= currentIndex ? theme.accent : 'transparent',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Slide Card Body */}
      <View style={styles.content}>
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.accentMuted }]}>
            <Text style={styles.iconEmoji}>{currentSlide.icon}</Text>
          </View>

          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: theme.accentMuted },
            ]}
          >
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              {currentSlide.badge}
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {currentSlide.title}
          </Text>

          <Text style={[styles.subtitle, { color: theme.accent }]}>
            {currentSlide.subtitle}
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {currentSlide.description}
          </Text>
        </View>
      </View>

      {/* Footer Navigation Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.accent }]}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentIndex === SLIDES.length - 1
              ? 'Start Writing'
              : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  versionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  versionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 26,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
