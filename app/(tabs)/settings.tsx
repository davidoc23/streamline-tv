import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import {
    setColorSchemePreference,
    useColorScheme,
    useColorSchemePreference,
} from '@/hooks/use-color-scheme.shared';
import { useShows } from '@/hooks/use-shows';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, deleteAccount, signOut } = useAuth();
  const { clearAccountData } = useShows();
  const appliedScheme = useColorScheme();
  const preference = useColorSchemePreference();

  const handleDeleteAccount = async () => {
    const accountEmail = user?.email ?? null;

    Alert.alert(
      'Delete account?',
      'This will remove your Firebase account and delete your local show data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await clearAccountData(accountEmail);
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert(
                'Unable to delete account',
                error instanceof Error ? error.message : 'Please sign in again and retry.',
              );
            }
          },
        },
      ],
    );
  };

  const preferenceButtons: { label: string; value: 'system' | 'light' | 'dark' }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <View style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText>
        Manage appearance, review the privacy policy, and delete your account from this device.
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Appearance</ThemedText>
        <ThemedText>Current theme: {appliedScheme ?? 'light'}</ThemedText>
        <View style={styles.buttonRow}>
          {preferenceButtons.map((button) => {
            const isSelected = preference === button.value;

            return (
              <Pressable
                key={button.value}
                onPress={() => {
                  void setColorSchemePreference(button.value);
                }}
                style={[styles.optionButton, isSelected ? styles.optionButtonActive : undefined]}
              >
                <ThemedText type="defaultSemiBold">{button.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Privacy</ThemedText>
        <ThemedText style={styles.body}>
          Read how the app stores account and watch data in the privacy policy.
        </ThemedText>
        <Link href="/privacy-policy" style={styles.link}>
          Read privacy policy
        </Link>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Account</ThemedText>
        <ThemedText style={styles.body}>{user?.email ?? 'No signed-in account found.'}</ThemedText>
        <Pressable onPress={() => void signOut()} style={styles.secondaryButton}>
          <ThemedText type="defaultSemiBold">Sign out</ThemedText>
        </Pressable>
        <Pressable onPress={handleDeleteAccount} style={styles.dangerButton}>
          <ThemedText type="defaultSemiBold">Delete account</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  optionButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dangerButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#8b1e3f',
  },
  link: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});