# StreamlineTV

A React Native app built with Expo Router for searching TV shows, subscribing to favorites, and tracking watched episodes with next-episode recommendations.

## Overview

StreamlineTV connects to the public TVMaze API and lets users build a lightweight watchlist. The app now includes Firebase Authentication plus device-local persistence so each user can keep their subscriptions and watch progress tied to the login email on that device.

The app supports:

- searching shows by title
- creating an account and signing in with Firebase Auth
- resetting forgotten passwords
- subscribing to favorite shows
- tracking watched episodes per season
- saving show progress locally on the device
- recommending the next unwatched episode
- surfacing the latest aired episode and upcoming episode info

## Features

- TVMaze search results with show summaries and posters
- login, signup, and password reset screens
- Firebase-backed session persistence
- subscribe / unsubscribe from shows
- on-device JSON storage for subscribed shows and progress
- home dashboard with continue-watching status, caught-up messaging, and new episode badges
- details screen with seasons, episode counts, and episode progress tracking
- season tabs and episode chips for marking watched episodes
- automatic progress saving when a subscribed show is updated
- latest aired episode badge and aired episode list

## Project structure

- `app/` — Expo Router route entrypoints
  - `app/(auth)/login.tsx` — login screen
  - `app/(auth)/signup.tsx` — signup screen
  - `app/(auth)/forgot-password.tsx` — password reset screen
  - `app/(tabs)/index.tsx` — home dashboard
  - `app/(tabs)/search.tsx` — search screen
  - `app/details.tsx` — show detail and progress screen
  - `app/_layout.tsx` — root stack layout and provider wrapping
  - `app/(tabs)/_layout.tsx` — bottom tab layout
- `hooks/use-auth.tsx` — Firebase auth state and helpers
- `hooks/use-shows.tsx` — per-email subscription state saved to a local JSON file
- `lib/firebase.ts` — Firebase app, auth, and Firestore setup
- `components/` — reusable UI components and themed wrappers
- `assets/` — images and static assets

## Firebase setup

Create a Firebase project and enable Email/Password authentication.

Then add these Expo public environment variables to your local `.env` file:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

An `.env.example` file is included with the same keys.

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

- Uses the TVMaze public API; no API key is required.
- Subscriptions and watched progress are stored locally on the device in a JSON file keyed by the signed-in email.
- Auth sessions persist locally through Firebase Auth persistence.
- The home screen and details screen use the same saved next-episode data, so the episode number stays in sync.

## Next improvements

- sync local progress to a cloud account later if needed
- support filtering aired vs upcoming episodes
- improve recommendation logic for resumed watching
- add offline caching for search results
- add a more complete onboarding or tutorial flow

## Tech stack

- Expo SDK 54
- `expo-router`
- `firebase`
- `react-native`
- `expo-image`
- `@react-navigation/bottom-tabs`
- `react-native-reanimated`

## License

MIT License

Copyright (c) 2023 David O Connor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.