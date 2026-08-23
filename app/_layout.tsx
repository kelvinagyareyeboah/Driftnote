import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNoteStore } from '@/src/store/useNoteStore';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function RootLayout() {
  useEffect(() => {
    // Initialize DB schema & Zustand stores on startup
    useNoteStore.getState().init();
    useAuthStore.getState().initAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#090D16' },
        }}
      >
        <Stack.Screen name="splash" options={{ title: 'Splash' }} />
        <Stack.Screen name="auth" options={{ title: 'Authentication' }} />
        <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
        <Stack.Screen name="editor" options={{ title: 'Editor' }} />
        <Stack.Screen name="history" options={{ title: 'Version History' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Welcome' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
