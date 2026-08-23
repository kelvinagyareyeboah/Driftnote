import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@driftnote_has_completed_onboarding';

export async function getHasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (e) {
    console.warn('[Storage] Error reading onboarding state:', e);
    return false;
  }
}

export async function setHasCompletedOnboarding(completed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
  } catch (e) {
    console.warn('[Storage] Error setting onboarding state:', e);
  }
}
