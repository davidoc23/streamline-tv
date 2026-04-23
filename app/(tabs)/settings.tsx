import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { user, firstName, updateFirstName, deleteAccount, signOut } = useAuth();
  const { clearAccountData } = useShows();
  const appliedScheme = useColorScheme();
  const preference = useColorSchemePreference();
  const [firstNameDraft, setFirstNameDraft] = useState(firstName ?? '');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setFirstNameDraft(firstName ?? '');
  }, [firstName]);

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

  const handleSaveFirstName = async () => {
    if (!firstNameDraft.trim()) {
      Alert.alert('First name required', 'Enter a first name before saving.');
      return;
    }

    setSavingName(true);

    try {
      await updateFirstName(firstNameDraft);
      Alert.alert('Saved', 'Your first name has been updated.');
    } catch (error) {
      Alert.alert('Unable to update first name', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage appearance, review the privacy policy, and delete your account from this device.
          </ThemedText>
        </View>

        <View style={styles.sectionLabelRow}>
          <ThemedText type="subtitle">Appearance</ThemedText>
          <ThemedText style={styles.sectionHint}>Current theme: {appliedScheme ?? 'light'}</ThemedText>
        </View>
        <ThemedView style={styles.groupCard}>
          <View style={styles.groupRows}>
            {preferenceButtons.map((button) => {
              const isSelected = preference === button.value;

              return (
                <Pressable
                  key={button.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
                  onPress={() => {
                    void setColorSchemePreference(button.value);
                  }}
                  style={({ pressed }) => [
                    styles.rowButton,
                    isSelected ? styles.rowButtonSelected : undefined,
                    pressed ? styles.rowButtonPressed : undefined,
                  ]}
                >
                  <ThemedText type="defaultSemiBold">{button.label}</ThemedText>
                  <View style={styles.rowTrailing}>
                    {isSelected ? <ThemedText style={styles.checkMark}>✓</ThemedText> : null}
                    <ThemedText style={styles.chevron}>›</ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        <View style={styles.sectionLabelRow}>
          <ThemedText type="subtitle">Privacy</ThemedText>
        </View>
        <ThemedView style={styles.groupCard}>
          <View style={styles.groupRows}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
              onPress={() => {
                router.push('/privacy-policy');
              }}
              style={({ pressed }) => [styles.rowButton, pressed ? styles.rowButtonPressed : undefined]}
            >
              <View style={styles.rowTextBlock}>
                <ThemedText type="defaultSemiBold">Privacy policy</ThemedText>
                <ThemedText style={styles.rowBody}>
                  Read how the app stores account and watch data in the privacy policy.
                </ThemedText>
              </View>
              <View style={styles.rowTrailing}>
                <ThemedText type="defaultSemiBold">Open</ThemedText>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </View>
            </Pressable>
          </View>
        </ThemedView>

        <View style={styles.sectionLabelRow}>
          <ThemedText type="subtitle">Account</ThemedText>
        </View>
        <ThemedView style={styles.groupCard}>
          <View style={styles.groupRows}>
            <View style={styles.nameEditor}>
              <ThemedText type="defaultSemiBold">First name</ThemedText>
              <TextInput
                autoCapitalize="words"
                placeholder="Your first name"
                placeholderTextColor="#7a7a7a"
                value={firstNameDraft}
                onChangeText={setFirstNameDraft}
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
                onPress={() => void handleSaveFirstName()}
                disabled={savingName}
                style={({ pressed }) => [
                  styles.saveNameButton,
                  pressed ? styles.rowButtonPressed : undefined,
                  savingName ? styles.saveNameButtonDisabled : undefined,
                ]}
              >
                <ThemedText type="defaultSemiBold">
                  {savingName ? 'Saving…' : 'Save name'}
                </ThemedText>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
              onPress={() => void signOut()}
              style={({ pressed }) => [styles.rowButton, pressed ? styles.rowButtonPressed : undefined]}
            >
              <View style={styles.rowTextBlock}>
                <ThemedText style={styles.rowBody}>{user?.email ?? 'No signed-in account found.'}</ThemedText>
              </View>
              <View style={styles.rowTrailing}>
                <ThemedText type="defaultSemiBold">Sign out</ThemedText>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
              onPress={handleDeleteAccount}
              style={({ pressed }) => [
                styles.rowButton,
                styles.dangerRowButton,
                pressed ? styles.rowButtonPressed : undefined,
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.dangerText}>
                Delete account
              </ThemedText>
              <ThemedText style={[styles.chevron, styles.dangerText]}>›</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 22,
  },
  header: {
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 22,
    opacity: 0.9,
  },
  sectionLabelRow: {
    paddingHorizontal: 8,
    gap: 5,
    marginTop: 2,
  },
  sectionHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  groupCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  groupRows: {
    gap: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  nameEditor: {
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
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
  saveNameButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
  },
  saveNameButtonDisabled: {
    opacity: 0.7,
  },
  rowButton: {
    alignSelf: 'stretch',
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowButtonPressed: {
    opacity: 0.92,
  },
  rowButtonSelected: {
    backgroundColor: 'rgba(10,126,164,0.18)',
  },
  rowTextBlock: {
    flex: 1,
    gap: 5,
  },
  rowBody: {
    lineHeight: 20,
    opacity: 0.82,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkMark: {
    color: '#0a7ea4',
    fontWeight: '700',
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 22,
    opacity: 0.45,
  },
  dangerRowButton: {
    backgroundColor: 'rgba(139, 30, 63, 0.18)',
  },
  dangerText: {
    color: '#ff7d9a',
  },
});