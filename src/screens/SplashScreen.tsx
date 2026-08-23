import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getHasCompletedOnboarding } from '@/src/services/storage';

export const SplashScreen: React.FC = () => {
  const router = useRouter();
  const initAuth = useAuthStore((state) => state.initAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    // Start smooth splash animation
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });

    badgeOpacity.value = withSequence(
      withTiming(0, { duration: 400 }),
      withTiming(1, { duration: 500 })
    );

    // Initialize auth state and perform route transition after delay
    const initTimer = setTimeout(async () => {
      await initAuth();
      const currentAuth = useAuthStore.getState().isAuthenticated;
      const hasOnboarded = await getHasCompletedOnboarding();

      if (!currentAuth) {
        router.replace('/auth' as any);
      } else if (!hasOnboarded) {
        router.replace('/onboarding' as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    }, 1800);

    return () => clearTimeout(initTimer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.brandContainer, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.appName}>Driftnote</Text>
        <Text style={styles.tagline}>Notes that never lose your work</Text>
      </Animated.View>

      <Animated.View style={[styles.footerBadge, badgeAnimatedStyle]}>
        <View style={styles.statusDot} />
        <Text style={styles.footerText}>SQLite Engine Ready</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#075985',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
  },
  footerBadge: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
});
