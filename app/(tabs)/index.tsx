import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useShows } from '@/hooks/use-shows';

export default function HomeScreen() {
  const router = useRouter();
  const { subscribedShows } = useShows();

  const getContinueWatchingText = (show: { nextEpisode?: string; lastWatched?: string }) => {
    if (show.nextEpisode) {
      if (show.nextEpisode.toLowerCase().includes('you have watched everything')) {
        return 'All caught up — check again later';
      }
      return `Continue watching: ${show.nextEpisode}`;
    }

    if (show.lastWatched) {
      return `Continue watching: ${show.lastWatched}`;
    }

    return 'Ready to watch';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">StreamlineTV</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Your subscribed shows</ThemedText>
        <ThemedText>
          This dashboard brings your watchlist into one place, with new episode badges and
          continue-watching status.
        </ThemedText>
      </ThemedView>

      {subscribedShows.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">No shows yet</ThemedText>
          <ThemedText>Search for a show to build your personal TV dashboard.</ThemedText>
          <Pressable onPress={() => router.push('/search')} style={styles.linkButton}>
            <ThemedText type="link">Browse shows</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <View style={styles.showGrid}>
          {subscribedShows.map((show) => (
            <Pressable
              key={show.id}
              onPress={() => router.push(`/details?id=${encodeURIComponent(show.id)}`)}
              style={styles.showCard}
            >
              {show.posterPath ? <Image source={{ uri: show.posterPath }} style={styles.showImage} /> : null}
              <View style={styles.showInfo}>
                <ThemedText type="subtitle">{show.name}</ThemedText>
                <ThemedText>{show.overview}</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaText}>
                  {getContinueWatchingText(show)}
                </ThemedText>
                {show.nextEpisode && !show.nextEpisode.toLowerCase().includes('you have watched everything') ? (
                  <ThemedView style={styles.badge}>
                    <ThemedText type="defaultSemiBold">New episode available</ThemedText>
                  </ThemedView>
                ) : null}
                {show.streamingInfo ? <ThemedText style={styles.metaText}>{show.streamingInfo}</ThemedText> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  emptyState: {
    gap: 12,
    marginBottom: 24,
  },
  linkButton: {
    marginTop: 8,
  },
  showGrid: {
    gap: 16,
  },
  showCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  showImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  showInfo: {
    padding: 16,
    gap: 8,
  },
  metaText: {
    marginTop: 4,
  },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#0a7ea4',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
