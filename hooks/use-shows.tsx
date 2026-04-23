import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Show = {
  id: string;
  name: string;
  overview: string;
  posterPath?: string;
  firstAirDate?: string;
  nextEpisode?: string;
  lastWatched?: string;
  lastWatchedSeason?: number;
  lastWatchedEpisode?: number;
  watchedEpisodes?: Array<{ season: number; episode: number }>;
  seasons?: number;
  episodes?: number;
  streamingInfo?: string;
};

type ShowsContextValue = {
  subscribedShows: Show[];
  subscribeShow: (show: Show) => void;
  unsubscribeShow: (showId: string) => void;
  isSubscribed: (showId: string) => boolean;
  getShowById: (showId: string) => Show | undefined;
};

const initialSubscribedShows: Show[] = [];


const ShowsContext = createContext<ShowsContextValue | undefined>(undefined);

export function ShowsProvider({ children }: { children: React.ReactNode }) {
  const [subscribedShows, setSubscribedShows] = useState<Show[]>(initialSubscribedShows);

  const subscribeShow = useCallback((show: Show) => {
    setSubscribedShows((current) => {
      const exists = current.some((item) => item.id === show.id);
      if (exists) {
        return current.map((item) => (item.id === show.id ? { ...item, ...show } : item));
      }
      return [show, ...current];
    });
  }, []);

  const unsubscribeShow = useCallback((showId: string) => {
    setSubscribedShows((current) => current.filter((show) => show.id !== showId));
  }, []);

  const isSubscribed = useCallback(
    (showId: string) => subscribedShows.some((show) => show.id === showId),
    [subscribedShows],
  );

  const getShowById = useCallback(
    (showId: string) => subscribedShows.find((show) => show.id === showId),
    [subscribedShows],
  );

  const value = useMemo(
    () => ({ subscribedShows, subscribeShow, unsubscribeShow, isSubscribed, getShowById }),
    [getShowById, isSubscribed, subscribeShow, subscribedShows, unsubscribeShow],
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
