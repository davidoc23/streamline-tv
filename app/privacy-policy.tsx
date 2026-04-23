import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'StreamlineTV collects account information for Firebase Auth, basic usage data, and show progress stored locally on your device.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your data to authenticate your account, provide subscriptions and tracking, and improve the app experience.',
  },
  {
    title: '3. Third-Party Services',
    body: 'We use Firebase for authentication and TVMaze for show data. TVMaze does not receive personal user data.',
  },
  {
    title: '4. Data Storage and Security',
    body: 'Auth is handled by Firebase and watch data is stored locally on your device in a JSON file.',
  },
  {
    title: '5. Data Sharing',
    body: 'We do not sell or share personal data with third parties.',
  },
  {
    title: '6. Data Retention',
    body: 'Your account remains until deleted and local data remains on the device until the app is removed or you delete the account data.',
  },
  {
    title: '7. Your Rights',
    body: 'You can access your data, delete your account, or stop using the app at any time.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Privacy Policy</ThemedText>
        <ThemedText style={styles.meta}>Effective Date: 23-04-2026</ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.body}>
            StreamlineTV respects your privacy. This policy explains what the app collects and how
            the data is handled.
          </ThemedText>
        </ThemedView>

        {sections.map((section) => (
          <ThemedView key={section.title} style={styles.card}>
            <ThemedText type="defaultSemiBold">{section.title}</ThemedText>
            <ThemedText style={styles.body}>{section.body}</ThemedText>
          </ThemedView>
        ))}

        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold">Contact</ThemedText>
          <ThemedText style={styles.body}>oconnordavid18@gmail.com</ThemedText>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  content: {
    gap: 16,
  },
  meta: {
    opacity: 0.8,
  },
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    lineHeight: 22,
  },
});