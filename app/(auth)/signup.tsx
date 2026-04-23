import { Link, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthPage } from '@/components/auth-page';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function SignupScreen() {
  const router = useRouter();
  const { user, loading, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setError('Fill in all fields to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signUp(email, password);
      router.replace('/(tabs)');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to sign up.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage
      title="Create your account"
      subtitle="Make a StreamlineTV account to save subscriptions and watched episode progress."
      footer={
        <View style={styles.footerRow}>
          <ThemedText>Already have an account?</ThemedText>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Log in
          </Link>
        </View>
      }
    >
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Email</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#7a7a7a"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Password</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="Create a password"
          placeholderTextColor="#7a7a7a"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Confirm password</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="Repeat your password"
          placeholderTextColor="#7a7a7a"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      </View>

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      <Pressable onPress={handleSignup} disabled={submitting} style={styles.primaryButton}>
        <ThemedText type="defaultSemiBold">
          {submitting ? 'Creating account…' : 'Sign up'}
        </ThemedText>
      </Pressable>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    color: '#111111',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  errorText: {
    color: '#c1121f',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  footerLink: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
