import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { getHasCompletedOnboarding } from '@/src/services/storage';

const { width } = Dimensions.get('window');

type AuthStep = 'landing' | 'login' | 'register' | 'forgot' | 'reset';

export const AuthScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerColor = themeMode === 'dark' ? '#075985' : '#FFAB91';

  const finishAuth = async () => {
    const hasOnboarded = await getHasCompletedOnboarding();
    if (!hasOnboarded) {
      router.replace('/onboarding' as any);
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() && step !== 'landing') {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    if (step === 'login') {
      if (!password.trim()) {
        Alert.alert('Required', 'Please enter your password.');
        return;
      }
      try {
        setIsSubmitting(true);
        await login(email);
        await finishAuth();
      } catch (e) {
        console.error('[Auth] Login error:', e);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 'register') {
      if (!password.trim()) {
        Alert.alert('Required', 'Please enter a password.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return;
      }
      try {
        setIsSubmitting(true);
        await register(email.split('@')[0] || 'Driftnote User', email);
        await finishAuth();
      } catch (e) {
        console.error('[Auth] Register error:', e);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 'forgot') {
      Alert.alert('OTP Sent', `A verification code has been sent to ${email}.`, [
        { text: 'Set New Password', onPress: () => setStep('reset') },
      ]);
    } else if (step === 'reset') {
      if (!password.trim() || password !== confirmPassword) {
        Alert.alert('Error', 'Please enter and confirm your new password.');
        return;
      }
      Alert.alert('Success', 'Password updated successfully.', [
        { text: 'Sign In', onPress: () => setStep('login') },
      ]);
    }
  };

  const handleQuickDemo = async () => {
    try {
      setIsSubmitting(true);
      await login('alex.morgan@driftnote.app', 'Alex Morgan');
      await finishAuth();
    } catch (e) {
      console.error('[Auth] Demo login error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Curved Hero Banner */}
          <View style={[styles.heroCurvedHeader, { backgroundColor: headerColor }]}>
            {/* Back Nav Button */}
            {step !== 'login' && step !== 'landing' && (
              <TouchableOpacity
                style={[styles.backNavBtn, { top: Math.max(insets.top + 4, 12) }]}
                onPress={() => setStep('login')}
                activeOpacity={0.7}
              >
                <Text style={styles.backNavIcon}>‹</Text>
              </TouchableOpacity>
            )}

            {/* Brand Logo Badge inside Curve */}
            <View style={[styles.curveBrandBadge, { top: Math.max(insets.top + 4, 12) }]}>
              <View style={styles.brandIconCircle}>
                <Text style={styles.brandIconText}>⚡</Text>
              </View>
              <Text style={styles.brandNameText}>Driftnote</Text>
            </View>

            {/* Bottom Arc Curve overlay */}
            <View
              style={[styles.bottomArcCurve, { backgroundColor: theme.background }]}
            />
          </View>

          {/* LANDING FRAME (Frame 6) */}
          {step === 'landing' && (
            <View style={styles.landingContainer}>
              <View style={styles.illustrationBox}>
                <Text style={styles.illustrationEmoji}>📝</Text>
              </View>

              <Text style={[styles.landingTitle, { color: theme.textPrimary }]}>
                Discover Your Notes
              </Text>

              <Text style={[styles.landingSub, { color: theme.textSecondary }]}>
                Explore all your thoughts stored safely on your device with high-speed local SQLite persistence.
              </Text>

              <View style={[styles.landingPillsBox, { backgroundColor: theme.surfaceBorder }]}>
                <TouchableOpacity
                  style={[styles.pillBtn, styles.pillBtnActive]}
                  onPress={() => setStep('login')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.pillBtnActiveText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pillBtn}
                  onPress={() => setStep('register')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.pillBtnText, { color: theme.textPrimary }]}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* LOGIN FRAME (Frame 7) */}
          {step === 'login' && (
            <View style={styles.formContainer}>
              <Text style={[styles.frameTitle, { color: theme.textPrimary }]}>
                Login here
              </Text>

              <Text style={[styles.frameSub, { color: theme.textSecondary }]}>
                Welcome back you've been missed!
              </Text>

              <View style={styles.inputsStack}>
                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Email"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.forgotLinkAlign}
                  onPress={() => setStep('forgot')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotLinkText, { color: theme.textPrimary }]}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pitch Black Solid Button */}
              <TouchableOpacity
                style={[
                  styles.blackPillBtn,
                  isSubmitting && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.blackPillBtnText}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchLinkTouch}
                onPress={() => setStep('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.switchLinkText, { color: theme.textSecondary }]}>
                  Create new account
                </Text>
              </TouchableOpacity>

              {/* Social Login Section */}
              <View style={styles.socialSection}>
                <Text style={[styles.orText, { color: theme.textMuted }]}>
                  Or continue with
                </Text>

                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}>G</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}>f</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}></Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoTile, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.demoTileText, { color: theme.accent }]}>1-Tap Demo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* CREATE ACCOUNT FRAME (Frame 8) */}
          {step === 'register' && (
            <View style={styles.formContainer}>
              <Text style={[styles.frameTitle, { color: theme.textPrimary }]}>
                Create account
              </Text>

              <Text style={[styles.frameSub, { color: theme.textSecondary }]}>
                Create an account so you can explore all notes
              </Text>

              <View style={styles.inputsStack}>
                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Email"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.blackPillBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.blackPillBtnText}>
                  {isSubmitting ? 'Creating account...' : 'Sign up'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchLinkTouch}
                onPress={() => setStep('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.switchLinkText, { color: theme.textSecondary }]}>
                  Already have an account
                </Text>
              </TouchableOpacity>

              {/* Social Login Section */}
              <View style={styles.socialSection}>
                <Text style={[styles.orText, { color: theme.textMuted }]}>
                  Or continue with
                </Text>

                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}>G</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}>f</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialSquareTile, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={handleQuickDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialSquareIcon}></Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* FORGOT PASSWORD FRAME (Frame 30) */}
          {step === 'forgot' && (
            <View style={styles.formContainer}>
              <Text style={[styles.frameTitle, { color: theme.textPrimary }]}>
                Forgot Password
              </Text>

              <Text style={[styles.frameSub, { color: theme.textSecondary }]}>
                Enter your email address. We will send you OTP
              </Text>

              <View style={styles.inputsStack}>
                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Email"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.blackPillBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.blackPillBtnText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SET NEW PASSWORD FRAME (Frame 31) */}
          {step === 'reset' && (
            <View style={styles.formContainer}>
              <Text style={[styles.frameTitle, { color: theme.textPrimary }]}>
                Set New Password
              </Text>

              <Text style={[styles.frameSub, { color: theme.textSecondary }]}>
                Enter your new password to restore account access
              </Text>

              <View style={styles.inputsStack}>
                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TextInput
                  style={[
                    styles.roundedInput,
                    {
                      backgroundColor: themeMode === 'dark' ? '#161E2E' : '#FFF3F0',
                      borderColor: themeMode === 'dark' ? theme.surfaceBorder : '#FFE0B2',
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.blackPillBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.blackPillBtnText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCurvedHeader: {
    position: 'relative',
    height: 140,
    marginBottom: 20,
    overflow: 'hidden',
  },
  backNavBtn: {
    position: 'absolute',
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backNavIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 26,
  },
  curveBrandBadge: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 10,
  },
  brandIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  brandIconText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  brandNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomArcCurve: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    right: -20,
    height: 80,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  landingContainer: {
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  illustrationBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  landingTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.6,
  },
  landingSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  landingPillsBox: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 16,
    padding: 4,
  },
  pillBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#000000',
  },
  pillBtnActiveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pillBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 28,
  },
  frameTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  frameSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  inputsStack: {
    gap: 16,
    marginBottom: 24,
  },
  roundedInput: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    borderWidth: 1,
  },
  forgotLinkAlign: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  blackPillBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  blackPillBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchLinkTouch: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 32,
  },
  switchLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialSquareTile: {
    width: 54,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialSquareIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  demoTile: {
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoTileText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
