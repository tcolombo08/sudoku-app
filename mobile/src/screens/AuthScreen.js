import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useFirebase from '../hooks/useFirebase.js';
import { colors } from '../theme/colors.js';

export default function AuthScreen() {
  const { signUp, signIn, signInAnonymous, signInWithGoogle, isLoading } = useFirebase();
  const [mode, setMode] = useState('menu'); // 'menu' | 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!nickname || nickname.length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }
    if (!email || !password || password.length < 6) {
      setError('Please fill all fields (password min 6 chars)');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await signUp(email, password, nickname);
    if (!result.success) {
      setError(result.message || 'Sign up failed');
    }
    setSubmitting(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    setSubmitting(false);
  };

  const handleGuest = async () => {
    setError('');
    setSubmitting(true);
    const result = await signInAnonymous();
    if (!result.success) {
      setError(result.message || 'Failed to start guest session');
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.message || 'Google sign-in failed');
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>🧩</Text>
            <Text style={styles.title}>Sudoku</Text>
            <Text style={styles.subtitle}>Challenge your mind</Text>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {mode === 'menu' && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setMode('signup')} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('login')} activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogle}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuest}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.guestButtonText}>
                  {submitting ? 'Loading...' : 'Play as Guest'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'signup' && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nickname"
                placeholderTextColor={colors.gray400}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.disabled]}
                onPress={handleSignUp}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'Creating account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('menu'); setError(''); }} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'login' && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.disabled]}
                onPress={handleSignIn}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('menu'); setError(''); }} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gray400,
    fontSize: 14,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  secondaryButtonText: {
    color: colors.gray900,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  googleButtonText: {
    color: colors.gray700,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.gray400,
  },
  guestButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    color: colors.gray500,
    fontSize: 15,
    fontWeight: '500',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
    fontSize: 14,
    color: colors.gray900,
  },
  disabled: {
    opacity: 0.5,
  },
  backButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.gray500,
    fontSize: 14,
  },
});
