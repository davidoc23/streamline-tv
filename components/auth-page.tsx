import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type AuthPageProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPage({ title, subtitle, children, footer }: AuthPageProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <ThemedText type="title">StreamlineTV</ThemedText>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        </View>

        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <View style={styles.form}>{children}</View>
        </ThemedView>

        {footer ? <ThemedView style={styles.footer}>{footer}</ThemedView> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 560,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  subtitle: {
    lineHeight: 22,
    maxWidth: 520,
  },
  card: {
    gap: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    width: '100%',
  },
  form: {
    gap: 12,
  },
  footer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
});
