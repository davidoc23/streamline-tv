import { Image } from 'expo-image';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useShows } from '@/hooks/use-shows';

type EpisodedItem = {
  id: number;
  season: number;
  number: number;
  name: string;
  airdate?: string;
};

type ShowDetails = {
  id: string;
  name: string;
  overview: string;
  posterPath?: string;
  firstAirDate?: string;
  seasons?: number;
  episodes?: number;
  streamingInfo?: string;
  nextEpisode?: string;
  seasonsList?: { id: number; name: string; episodeCount: number; airDate?: string }[];
  watchedEpisodes?: { season: number; episode: number }[];
};

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscribeShow, unsubscribeShow, isSubscribed, getShowById } = useShows();
  const showId = String(params.id ?? '');

  const [details, setDetails] = useState<ShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<EpisodedItem[]>([]);
  const [episodeDropdownOpen, setEpisodeDropdownOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<{ season: number; episode: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview: ShowDetails = useMemo(
    () => ({
      id: showId,
      name: String(params.name ?? 'Show details'),
      overview: String(params.overview ?? 'No description available.'),
      posterPath: String(params.posterPath ?? ''),
      firstAirDate: String(params.firstAirDate ?? ''),
      streamingInfo: 'Streaming availability may vary',
      seasons: undefined,
      episodes: undefined,
      nextEpisode: undefined,
      seasonsList: [],
    }),
    [params, showId],
  );

  const subscribedShow = getShowById(showId);
  const show = useMemo(() => details ?? { ...preview, ...subscribedShow }, [details, preview, subscribedShow]);
  const subscribed = isSubscribed(showId);

  const episodeSeasonCount = useMemo(
    () => new Set(episodes.map((episode) => episode.season)).size,
    [episodes],
  );

  const totalSeasons = episodeSeasonCount > 0
    ? episodeSeasonCount
    : details?.seasons ?? details?.seasonsList?.length ?? 0;
  const totalEpisodes = details?.episodes ?? episodes.length;

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const airedEpisodes = useMemo(
    () =>
      episodes.filter((episode) => {
        if (!episode.airdate) {
          return false;
        }

        const airDate = new Date(`${episode.airdate}T00:00:00`);
        return airDate <= today;
      }),
    [episodes, today],
  );

  const latestAiredEpisode = useMemo(() => {
    if (airedEpisodes.length === 0) {
      return undefined;
    }

    return airedEpisodes
      .slice()
      .sort(
        (a, b) =>
          new Date(`${b.airdate}T00:00:00`).getTime() -
          new Date(`${a.airdate}T00:00:00`).getTime(),
      )[0];
  }, [airedEpisodes]);

  const nextEpisode = useMemo(() => {
    const futureEpisodes = episodes
      .filter((episode) => {
        if (!episode.airdate) {
          return false;
        }

        const airDate = new Date(`${episode.airdate}T00:00:00`);
        return airDate > today;
      })
      .sort(
        (a, b) =>
          new Date(`${a.airdate}T00:00:00`).getTime() - new Date(`${b.airdate}T00:00:00`).getTime(),
      );

    if (futureEpisodes.length === 0) {
      return undefined;
    }

    const next = futureEpisodes[0];
    return `${next.name} on ${next.airdate}`;
  }, [episodes, today]);

  useEffect(() => {
    async function loadShowDetails() {
      if (!showId) {
        setError('No show selected.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.tvmaze.com/shows/${showId}?embed=seasons`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error('Unable to load show details');
        }

        const summary = String(json.summary ?? 'No description available.').replace(/<[^>]+>/g, '');
        const seasons = Array.isArray(json._embedded?.seasons) ? json._embedded.seasons : [];
        const filteredSeasons = seasons.filter((season: any) => {
          const name = String(season.name ?? '').toLowerCase();
          return season.number > 0 && name !== 'special' && name !== 'specials';
        });

        setDetails({
          id: String(json.id),
          name: json.name,
          overview: summary,
          posterPath: json.image?.original ?? json.image?.medium,
          firstAirDate: json.premiered,
          seasons: filteredSeasons.length,
          episodes: undefined,
          streamingInfo: json.networks?.[0]?.name ?? 'Streaming availability may vary',
          nextEpisode: nextEpisode,
          seasonsList: filteredSeasons.map((season: any) => ({
            id: season.id,
            name: season.name,
            episodeCount: season.episodeOrder ?? season.episode_count,
            airDate: season.premiereDate,
          })),
        });
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load show details.');
      } finally {
        setLoading(false);
      }
    }

    loadShowDetails();
  }, [showId, nextEpisode]);

  useEffect(() => {
    async function loadEpisodes() {
      if (!showId || episodes.length > 0) {
        return;
      }

      try {
        const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error('Unable to load episode list');
        }

        const mapped = (json ?? []).map((episode: any) => ({
          id: episode.id,
          season: episode.season,
          number: episode.number,
          name: episode.name || `Episode ${episode.number}`,
          airdate: episode.airdate,
        }));

        setEpisodes(mapped);

        const defaultSeason = mapped.length > 0 ? mapped[0].season : null;
        const watchedSeasons = subscribedShow?.watchedEpisodes?.map((item) => item.season) ?? [];
        const sortedWatchedSeasons = watchedSeasons.length > 0 ? watchedSeasons.sort((a, b) => a - b) : [];

        setSelectedSeason(
          sortedWatchedSeasons.length > 0
            ? sortedWatchedSeasons[0]
            : subscribedShow?.lastWatchedSeason ?? defaultSeason,
        );

        setWatchedEpisodes(subscribedShow?.watchedEpisodes ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load episode list.');
      }
    }

    loadEpisodes();
  }, [showId, episodes.length, subscribedShow]);

  const episodeButtonLabel = episodeDropdownOpen
    ? `Hide aired episodes (${airedEpisodes.length})`
    : `Show aired episodes (${airedEpisodes.length})`;

  const seasonOptions = useMemo(
    () => Array.from(new Set(episodes.map((episode) => episode.season))).sort((a, b) => a - b),
    [episodes],
  );

  const activeEpisodes = useMemo(
    () => episodes.filter((episode) => episode.season === selectedSeason),
    [episodes, selectedSeason],
  );

  const watchedSet = useMemo(
    () => new Set(watchedEpisodes.map((item) => `${item.season}-${item.episode}`)),
    [watchedEpisodes],
  );

  const isEpisodeWatched = useCallback(
    (episode: EpisodedItem) => watchedSet.has(`${episode.season}-${episode.number}`),
    [watchedSet],
  );

  const watchedInSeason = useMemo(
    () =>
      watchedEpisodes
        .filter((item) => item.season === selectedSeason)
        .map((item) => item.episode)
        .sort((a, b) => a - b),
    [watchedEpisodes, selectedSeason],
  );

  const watchedEpisodeLabel = useMemo(() => {
    if (watchedEpisodes.length === 0) {
      return 'None selected';
    }

    return watchedEpisodes
      .slice()
      .sort((a, b) => (a.season === b.season ? a.episode - b.episode : a.season - b.season))
      .map((item) => `S${item.season}E${item.episode}`)
      .join(', ');
  }, [watchedEpisodes]);

  const nextEpisodeItem = useMemo(() => {
    if (episodes.length === 0) {
      return undefined;
    }

    const sortedEpisodes = episodes
      .slice()
      .sort((a, b) => (a.season === b.season ? a.number - b.number : a.season - b.season));

    return sortedEpisodes.find((episode) => !isEpisodeWatched(episode));
  }, [episodes, isEpisodeWatched]);

  const getNextEpisodeForWatched = useCallback(
    (watched: { season: number; episode: number }[]) => {
      if (episodes.length === 0) {
        return undefined;
      }

      const watchedSetForNext = new Set(watched.map((item) => `${item.season}-${item.episode}`));
      const sortedEpisodes = episodes
        .slice()
        .sort((a, b) => (a.season === b.season ? a.number - b.number : a.season - b.season));

      return sortedEpisodes.find((episode) => !watchedSetForNext.has(`${episode.season}-${episode.number}`));
    },
    [episodes],
  );

  const formatEpisodeRecommendation = useCallback((episode: EpisodedItem | undefined) => {
    if (!episode) {
      return undefined;
    }

    const episodeLabel = `S${episode.season}E${episode.number}`;
    const dateLabel = episode.airdate ? ` on ${episode.airdate}` : '';
    return `${episodeLabel}: ${episode.name}${dateLabel}`;
  }, []);

  const nextToWatch = useMemo(() => {
    if (episodes.length === 0) {
      return 'Choose watched episodes to get a recommendation.';
    }

    if (!nextEpisodeItem) {
      return 'You have watched all episodes.';
    }

    return `You can watch the next episode: ${formatEpisodeRecommendation(nextEpisodeItem)}`;
  }, [episodes, formatEpisodeRecommendation, nextEpisodeItem]);

  const getSavedShow = useCallback(
    (watched: { season: number; episode: number }[]) => ({
      ...(() => {
        const nextEpisodeForWatched = getNextEpisodeForWatched(watched);

        return {
          nextEpisode:
            watched.length === 0
              ? 'Choose watched episodes to get a recommendation.'
              : nextEpisodeForWatched
                ? `You can watch the next episode: ${formatEpisodeRecommendation(nextEpisodeForWatched)}`
                : 'You have watched all episodes.',
          nextEpisodeSeason: nextEpisodeForWatched?.season,
          nextEpisodeEpisode: nextEpisodeForWatched?.number,
          nextEpisodeTitle: nextEpisodeForWatched?.name,
          nextEpisodeAirdate: nextEpisodeForWatched?.airdate,
        };
      })(),
      id: show.id,
      name: show.name,
      overview: show.overview,
      posterPath: show.posterPath,
      firstAirDate: show.firstAirDate,
      streamingInfo: show.streamingInfo,
      seasons: totalSeasons,
      episodes: totalEpisodes,
      lastWatched: watched.length > 0
        ? watched
            .slice()
            .sort((a, b) => (a.season === b.season ? a.episode - b.episode : a.season - b.season))
            .map((item) => `S${item.season}E${item.episode}`)
            .join(', ')
        : 'None selected',
      lastWatchedSeason: watched.length > 0 ? watched[watched.length - 1]?.season : undefined,
      lastWatchedEpisode: watched.length > 0 ? watched[watched.length - 1]?.episode : undefined,
      watchedEpisodes: watched,
    }),
    [formatEpisodeRecommendation, getNextEpisodeForWatched, show, totalEpisodes, totalSeasons],
  );

  const saveShowProgress = useCallback(
    (watched: { season: number; episode: number }[]) => {
      subscribeShow(getSavedShow(watched));
    },
    [getSavedShow, subscribeShow],
  );

  const toggleEpisodeWatched = useCallback(
    (episode: EpisodedItem) => {
      const nextWatched = watchedEpisodes.some(
        (item) => item.season === episode.season && item.episode === episode.number,
      )
        ? watchedEpisodes.filter(
            (item) => item.season !== episode.season || item.episode !== episode.number,
          )
        : [...watchedEpisodes, { season: episode.season, episode: episode.number }];

      setWatchedEpisodes(nextWatched);
      saveShowProgress(nextWatched);
    },
    [saveShowProgress, watchedEpisodes],
  );

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      {show.posterPath ? <Image source={{ uri: show.posterPath }} style={styles.poster} /> : null}

      <View style={styles.headerContainer}>
        <ThemedText type="title">{show.name}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.subTitle}>
          {show.firstAirDate ?? 'Premiere date unknown'}
        </ThemedText>
      </View>

      {latestAiredEpisode ? (
        <ThemedView style={styles.badge}>
          <ThemedText type="defaultSemiBold">
            Latest episode: {latestAiredEpisode.name} on {latestAiredEpisode.airdate}
          </ThemedText>
        </ThemedView>
      ) : null}

      <ThemedText style={styles.body}>{show.overview}</ThemedText>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold">Seasons</ThemedText>
          <ThemedText>{totalSeasons ?? '-'}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold">Episodes</ThemedText>
          <ThemedText>{totalEpisodes ?? '-'}</ThemedText>
        </View>
      </View>

      {seasonOptions.length > 0 ? (
        <View style={styles.progressSection}>
          <ThemedText type="subtitle">Track your progress</ThemedText>
          <View style={styles.seasonTabs}>
            {seasonOptions.map((season) => (
              <Pressable
                key={season}
                onPress={() => setSelectedSeason(season)}
                style={[
                  styles.seasonTab,
                  selectedSeason === season ? styles.seasonTabActive : undefined,
                ]}
              >
                <ThemedText type="defaultSemiBold">Season {season}</ThemedText>
              </Pressable>
            ))}
          </View>

          {selectedSeason ? (
            <View style={styles.episodeSelection}>
              <ThemedText type="defaultSemiBold">Mark watched episode(s)</ThemedText>
              <View style={styles.episodeChips}>
                {activeEpisodes.map((episode) => (
                  <Pressable
                    key={episode.id}
                    onPress={() => toggleEpisodeWatched(episode)}
                    style={[
                      styles.episodeChip,
                      isEpisodeWatched(episode) ? styles.episodeChipActive : undefined,
                    ]}
                  >
                    <ThemedText>{episode.number}</ThemedText>
                  </Pressable>
                ))}
              </View>
              <ThemedText type="defaultSemiBold">Watched this season</ThemedText>
              <ThemedText>{watchedInSeason.length > 0 ? watchedInSeason.join(', ') : 'None selected'}</ThemedText>
              <ThemedText type="defaultSemiBold">All watched</ThemedText>
              <ThemedText>{watchedEpisodeLabel}</ThemedText>
              <ThemedText type="defaultSemiBold">Next for you</ThemedText>
              <ThemedText>{nextToWatch}</ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable onPress={() => setEpisodeDropdownOpen((current) => !current)} style={styles.episodeToggle}>
        <ThemedText type="defaultSemiBold">{episodeButtonLabel}</ThemedText>
      </Pressable>

      {episodeDropdownOpen && (
        <View style={styles.episodeList}>
          {airedEpisodes.length > 0 ? (
            airedEpisodes.map((episode) => (
              <View key={episode.id} style={styles.episodeRow}>
                <View style={styles.episodeHeader}>
                  <ThemedText type="defaultSemiBold">
                    S{episode.season} · E{episode.number}
                  </ThemedText>
                  <ThemedText style={styles.episodeAirdate}>{episode.airdate ?? 'TBA'}</ThemedText>
                </View>
                <ThemedText>{episode.name}</ThemedText>
              </View>
            ))
          ) : episodes.length > 0 ? (
            <ThemedText>No aired episodes yet.</ThemedText>
          ) : (
            <ThemedText>Loading aired episodes…</ThemedText>
          )}
        </View>
      )}

      <View style={styles.detailRow}>
        <ThemedText type="defaultSemiBold">Streaming</ThemedText>
        <ThemedText>{show.streamingInfo}</ThemedText>
      </View>

      {loading ? <ThemedText>Loading show details…</ThemedText> : null}
      {error ? <ThemedText>{error}</ThemedText> : null}

      <Pressable
        onPress={() =>
          subscribed
            ? unsubscribeShow(show.id)
            : saveShowProgress(watchedEpisodes)
        }
        style={styles.subscribeButton}
      >
        <ThemedText type="defaultSemiBold">
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </ThemedText>
      </Pressable>

      <Link href="/">
        <ThemedText type="link">Back to Home</ThemedText>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
    gap: 16,
  },
  poster: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
  },
  metaText: {
    color: '#6f6f6f',
  },
  body: {
    lineHeight: 22,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerContainer: {
    gap: 8,
  },
  subTitle: {
    color: '#6f6f6f',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressSection: {
    gap: 12,
  },
  seasonTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonTab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  seasonTabActive: {
    backgroundColor: '#0a7ea4',
  },
  episodeSelection: {
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  episodeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  episodeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  episodeChipActive: {
    backgroundColor: '#0a7ea4',
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
  },
  episodeToggle: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
  },
  episodeList: {
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
  },
  episodeRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  episodeAirdate: {
    color: '#6f6f6f',
  },
  subscribeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
  },
});