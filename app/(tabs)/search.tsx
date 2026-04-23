import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useShows } from '@/hooks/use-shows';

type SearchResult = {
  id: string;
  name: string;
  overview: string;
  posterPath?: string;
  firstAirDate?: string;
};

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

export default function SearchScreen() {
  const router = useRouter();
  const { subscribeShow, unsubscribeShow, isSubscribed } = useShows();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchShows = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Search for a show by name.');
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`,
      );
      const json = await response.json();

      if (!response.ok) {
        throw new Error('Unable to load shows');
      }

      const mapped = (json ?? []).map((item: any) => ({
        id: String(item.show.id),
        name: item.show.name,
        overview: stripHtml(item.show.summary ?? 'No description available.'),
        posterPath: item.show.image?.medium ?? item.show.image?.original,
        firstAirDate: item.show.premiered,
      }));

      setResults(mapped);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={{ uri: 'https://static.tvmaze.com/images/tvm-header.png' }}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Search</ThemedText>
      </ThemedView>
      <ThemedText style={styles.description}>
        Find new shows and add them to your watchlist. Search by title to see results from TVMaze.
      </ThemedText>

      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search for a show"
          placeholderTextColor="#7a7a7a"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchShows}
          style={styles.searchInput}
        />
        <Pressable onPress={searchShows} style={styles.searchButton}>
          <ThemedText type="defaultSemiBold">Search</ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <ThemedText>Loading search results…</ThemedText>
      ) : error ? (
        <ThemedText>{error}</ThemedText>
      ) : results.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          {query ? 'No matches found yet. Try a different title.' : 'Start typing to find TV shows.'}
        </ThemedText>
      ) : (
        <View style={styles.resultsList}>
          {results.map((show) => (
            <View key={show.id} style={styles.resultCard}>
              {show.posterPath ? <Image source={{ uri: show.posterPath }} style={styles.resultImage} /> : null}
              <View style={styles.resultInfo}>
                <ThemedText type="subtitle">{show.name}</ThemedText>
                <ThemedText>{show.overview}</ThemedText>
                <ThemedText style={styles.metaText}>{show.firstAirDate}</ThemedText>
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() =>
                      isSubscribed(show.id)
                        ? unsubscribeShow(show.id)
                        : subscribeShow({
                            id: show.id,
                            name: show.name,
                            overview: show.overview,
                            posterPath: show.posterPath,
                            firstAirDate: show.firstAirDate,
                            streamingInfo: 'Streaming availability may vary',
                          })
                    }
                    style={styles.subscribeButton}
                  >
                    <ThemedText type="link">
                      {isSubscribed(show.id) ? 'Unsubscribe' : 'Subscribe'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/details?id=${encodeURIComponent(show.id)}`)}
                    style={styles.detailsButton}
                  >
                    <ThemedText type="defaultSemiBold">Details</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 340,
    height: 220,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    bottom: -40,
    left: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  description: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 14,
    padding: 12,
    minHeight: 48,
    color: '#111111',
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
  },
  emptyText: {
    marginTop: 8,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  resultImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  resultInfo: {
    padding: 16,
    gap: 10,
  },
  metaText: {
    color: '#6f6f6f',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  subscribeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(10,126,164,0.12)',
  },
  detailsButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(10,126,164,0.18)',
  },
});
