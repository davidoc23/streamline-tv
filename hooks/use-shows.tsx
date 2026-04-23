import { File, Paths } from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';

export type Show = {
  id: string;
  name: string;
  overview: string;
  posterPath?: string;
  firstAirDate?: string;
  nextEpisode?: string;
  nextEpisodeSeason?: number;
  nextEpisodeEpisode?: number;
  nextEpisodeTitle?: string;
  nextEpisodeAirdate?: string;
  lastWatched?: string;
  lastWatchedSeason?: number;
  lastWatchedEpisode?: number;
  watchedEpisodes?: { season: number; episode: number }[];
  seasons?: number;
  episodes?: number;
  streamingInfo?: string;
};

type ShowsContextValue = {
  subscribedShows: Show[];
  loading: boolean;
  subscribeShow: (show: Show) => void;
  unsubscribeShow: (showId: string) => void;
  clearAccountData: (email?: string | null) => Promise<void>;
  isSubscribed: (showId: string) => boolean;
  getShowById: (showId: string) => Show | undefined;
};

const ShowsContext = createContext<ShowsContextValue | undefined>(undefined);

const showsStoreFile = new File(Paths.document, 'streamline-tv-shows.json');

function getAccountKey(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

async function readShowStore(): Promise<Record<string, Show[]>> {
  if (!showsStoreFile.exists) {
    return {};
  }

  const raw = await showsStoreFile.text();

  if (!raw.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entries = Object.entries(parsed).filter(([, value]) => Array.isArray(value));
    return Object.fromEntries(entries) as Record<string, Show[]>;
  } catch (error) {
    console.error('Failed to parse local show store', error);
    return {};
  }
}

export function ShowsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [subscribedShows, setSubscribedShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accountKey = getAccountKey(user?.email);
    let active = true;

    if (!accountKey) {
      setSubscribedShows([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    void readShowStore()
      .then((store) => {
        if (!active) {
          return;
        }

        setSubscribedShows(store[accountKey] ?? []);
      })
      .catch((error) => {
        console.error(`Failed to load local shows for ${accountKey}`, error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.email]);

  const persistShows = useCallback(
    (nextShows: Show[]) => {
      const accountKey = getAccountKey(user?.email);

      if (!user || !accountKey) {
        return;
      }

      void readShowStore()
        .then((store) => {
          store[accountKey] = nextShows;
          showsStoreFile.write(JSON.stringify(store, null, 2));
        })
        .catch((error) => {
          console.error(`Failed to save local shows for ${accountKey}`, error);
        });
    },
    [user?.email],
  );

  const subscribeShow = useCallback(
    (show: Show) => {
      setSubscribedShows((current) => {
        const exists = current.some((item) => item.id === show.id);
        const nextShows = exists
          ? current.map((item) => (item.id === show.id ? { ...item, ...show } : item))
          : [show, ...current];

        persistShows(nextShows);
        return nextShows;
      });
    },
    [persistShows],
  );

  const unsubscribeShow = useCallback(
    (showId: string) => {
      setSubscribedShows((current) => {
        const nextShows = current.filter((show) => show.id !== showId);
        persistShows(nextShows);
        return nextShows;
      });
    },
    [persistShows],
  );

  const clearAccountData = useCallback(async (email?: string | null) => {
    const accountKey = getAccountKey(email ?? user?.email);

    if (!accountKey) {
      return;
    }

    try {
      const store = await readShowStore();
      if (store[accountKey]) {
        delete store[accountKey];
        showsStoreFile.write(JSON.stringify(store, null, 2));
      }
    } catch (error) {
      console.error(`Failed to clear local shows for ${accountKey}`, error);
    }
  }, [user?.email]);

  const isSubscribed = useCallback(
    (showId: string) => subscribedShows.some((show) => show.id === showId),
    [subscribedShows],
  );

  const getShowById = useCallback(
    (showId: string) => subscribedShows.find((show) => show.id === showId),
    [subscribedShows],
  );

  const value = useMemo(
    () => ({
      subscribedShows,
      loading: loading || authLoading,
      subscribeShow,
      unsubscribeShow,
      clearAccountData,
      isSubscribed,
      getShowById,
    }),
    [authLoading, clearAccountData, getShowById, isSubscribed, loading, subscribeShow, subscribedShows, unsubscribeShow],
  );

  return <ShowsContext.Provider value={value}>{children}</ShowsContext.Provider>;
}

export function useShows() {
  const context = useContext(ShowsContext);
  if (!context) {
    throw new Error('useShows must be used within a ShowsProvider');
  }

  return context;
}
