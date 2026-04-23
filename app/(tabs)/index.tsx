import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useShows } from '@/hooks/use-shows';

export default function HomeScreen() {
  const router = useRouter();
  const { user, firstName, signOut } = useAuth();
  const { subscribedShows, loading } = useShows();
  const greetingName = firstName || 'there';

  const isFutureAirdate = (airdate?: string) => {
    if (!airdate) {
      return false;
    }

    const parsedAirdate = new Date(`${airdate}T00:00:00`);
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return parsedAirdate > todayAtMidnight;
  };

  const getContinueWatchingText = (show: {
    nextEpisode?: string;
    nextEpisodeSeason?: number;
    nextEpisodeEpisode?: number;
    nextEpisodeTitle?: string;
    nextEpisodeAirdate?: string;
    lastWatched?: string;
  }) => {
    if (
      show.nextEpisodeSeason != null &&
      show.nextEpisodeEpisode != null &&
      show.nextEpisodeTitle
    ) {
      const airdateText = show.nextEpisodeAirdate ? ` on ${show.nextEpisodeAirdate}` : '';
      const prefix = isFutureAirdate(show.nextEpisodeAirdate) ? 'Coming soon:' : 'You can watch the next episode:';
      return `${prefix} S${show.nextEpisodeSeason}E${show.nextEpisodeEpisode}: ${show.nextEpisodeTitle}${airdateText}`;
    }

    if (show.nextEpisode) {
      if (show.nextEpisode.toLowerCase().includes('you have watched all episodes')) {
        return 'You have watched all episodes.';
      }
      return show.nextEpisode;
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
        <View style={styles.titleCopy}>
          <ThemedText style={styles.greeting}>Hello, {greetingName}</ThemedText> 
        </View>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Your subscribed shows</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">Loading your account</ThemedText>
          <ThemedText>Fetching your subscribed shows and watch progress…</ThemedText>
        </ThemedView>
      ) : null}

      {!loading && subscribedShows.length === 0 ? (
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
                {(show.nextEpisodeSeason != null && show.nextEpisodeEpisode != null) ||
                (show.nextEpisode && !show.nextEpisode.toLowerCase().includes('you have watched all episodes')) ? (
                  <ThemedView style={styles.badge}>
                    <ThemedText type="defaultSemiBold">
                      {isFutureAirdate(show.nextEpisodeAirdate) ? 'Coming soon' : 'New episode available'}
                    </ThemedText>
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
    justifyContent: 'space-between',
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  accountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 16,
  },
  accountCopy: {
    flex: 1,
    gap: 4,
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
