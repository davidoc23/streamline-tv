import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

type FirebaseConfigKey = (typeof requiredKeys)[number];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as FirebaseConfigKey]);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingKeys.join(', ')}. Add them to your local .env file using EXPO_PUBLIC_FIREBASE_* keys and restart Expo.`,
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const authStorage = createAsyncStorage('streamline-tv-auth');

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(authStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
