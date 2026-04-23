import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthPage } from '@/components/auth-page';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter the email address for your account.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage
      title="Reset your password"
      subtitle="Send a password reset email to regain access to your account."
      footer={
        <View style={styles.footerRow}>
          <ThemedText>Remembered your password?</ThemedText>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Back to login
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

      {message ? <ThemedText style={styles.successText}>{message}</ThemedText> : null}
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      <Pressable onPress={handleReset} disabled={submitting} style={styles.primaryButton}>
        <ThemedText type="defaultSemiBold">
          {submitting ? 'Sending…' : 'Send reset email'}
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
  successText: {
    color: '#1b5e20',
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
