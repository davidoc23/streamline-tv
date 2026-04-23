import { File, Paths } from 'expo-file-system';
import { useEffect, useSyncExternalStore } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

const themePreferenceFile = new File(Paths.document, 'streamline-tv-theme.json');

let currentPreference: ColorSchemePreference = 'system';
let hydrationPromise: Promise<void> | null = null;
let isHydrated = false;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentPreference;
}

async function loadPreferenceFromDisk() {
  if (!themePreferenceFile.exists) {
    return 'system' as const;
  }

  const raw = await themePreferenceFile.text();

  if (!raw.trim()) {
    return 'system' as const;
  }

  try {
    const parsed = JSON.parse(raw) as { preference?: string };
    if (parsed.preference === 'light' || parsed.preference === 'dark' || parsed.preference === 'system') {
      return parsed.preference;
    }
  } catch (error) {
    console.error('Failed to parse theme preference', error);
  }

  return 'system' as const;
}

async function hydratePreference() {
  if (isHydrated) {
    return;
  }

  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = (async () => {
    try {
      currentPreference = await loadPreferenceFromDisk();
    } catch (error) {
      console.error('Failed to load theme preference', error);
      currentPreference = 'system';
    } finally {
      isHydrated = true;
      hydrationPromise = null;
      emitChange();
    }
  })();

  return hydrationPromise;
}

async function writePreference(nextPreference: ColorSchemePreference) {
  currentPreference = nextPreference;
  isHydrated = true;
  emitChange();

  try {
    themePreferenceFile.write(JSON.stringify({ preference: nextPreference }, null, 2));
  } catch (error) {
    console.error('Failed to save theme preference', error);
  }
}

export async function setColorSchemePreference(nextPreference: ColorSchemePreference) {
  await writePreference(nextPreference);
}

export async function resetColorSchemePreference() {
  await writePreference('system');
}

export function useColorSchemePreference() {
  useEffect(() => {
    void hydratePreference();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useColorScheme() {
  const preference = useColorSchemePreference();
  const systemColorScheme = useSystemColorScheme();

  if (preference === 'system') {
    return systemColorScheme;
  }

  return preference;
}