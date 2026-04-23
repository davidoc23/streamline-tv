# StreamlineTV

A React Native app built with Expo Router for searching TV shows, subscribing to favorites, and tracking watched episodes with next-episode recommendations.

## Overview

StreamlineTV connects to the public TVMaze API and lets users build a lightweight watchlist. The app supports:

- searching shows by title
- subscribing to favorite shows
- tracking watched episodes per season
- recommending the next unwatched episode
- surfacing the latest aired episode and upcoming episode info

## Features

- TVMaze search results with show summaries and posters
- subscribe / unsubscribe from shows
- home dashboard with continue-watching status and new episode badges
- details screen with seasons, episode counts, and episode progress tracking
- season tabs and episode chips for marking watched episodes
- automatic progress saving when a subscribed show is updated
- latest aired episode badge and aired episode list

## Project structure

- `app/` — Expo Router route entrypoints
  - `app/(tabs)/index.tsx` — home dashboard
  - `app/(tabs)/search.tsx` — search screen
  - `app/details.tsx` — show detail and progress screen
  - `app/_layout.tsx` — root stack layout and provider wrapping
  - `app/(tabs)/_layout.tsx` — bottom tab layout
- `hooks/use-shows.tsx` — shared subscription state and helpers
- `components/` — reusable UI components and themed wrappers
- `assets/` — images and static assets

## Installation

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

## Useful commands

- `npm run android` — open on Android emulator/device
- `npm run ios` — open on iOS simulator/device
- `npm run web` — open in the browser
- `npm run lint` — run Expo lint checks

## Notes

- uses the TVMaze public API; no API key is required
- subscriptions and watched progress are stored in app memory via `hooks/use-shows.tsx`
- progress is not persisted across reloads in the current implementation

## Next improvements

- persist subscription and progress data locally
- support filtering aired vs upcoming episodes
- improve recommendation logic for resumed watching
- add offline caching for search results
- add a more complete onboarding or tutorial flow

## Tech stack

- Expo SDK 54
- `expo-router`
- `react-native`
- `expo-image`
- `@react-navigation/bottom-tabs`
- `react-native-reanimated`

## License

This project is private.
