import { Link, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { AuthPage } from '@/components/auth-page';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage
      title="Log in"
      subtitle="Access your synced shows, episode progress, and recommendations from any device."
      footer={
        <View style={styles.footerRow}>
          <ThemedText>New here?</ThemedText>
          <Link href="/(auth)/signup" style={styles.footerLink}>
            Sign up
          </Link>
          <Link href="/(auth)/forgot-password" style={styles.footerLink}>
            Forgot password?
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
          autoComplete="password"
          placeholder="••••••••"
          placeholderTextColor="#7a7a7a"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      <Pressable onPress={handleLogin} disabled={submitting} style={styles.primaryButton}>
        <ThemedText type="defaultSemiBold">
          {submitting ? 'Logging in…' : 'Log in'}
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
