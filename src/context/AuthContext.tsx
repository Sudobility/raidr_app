/**
 * AuthContext — Firebase Authentication for the web app.
 *
 * The auth *logic* is `@sudobility/auth_lib`
 * (`createFirebaseAuthContext` over `useFirebaseAuthJs`), not
 * `@sudobility/components` — that package is pure UI. Google sign-in goes
 * through Firebase's own `signInWithPopup` (`webPopup: true`); email is the
 * JS SDK's. The Firebase app is initialised by the app shell
 * (`initializeFirebaseAuth()` in `SudobilityAppWithFirebaseAuthAndEntities`);
 * `auth_lib` reuses it from the same `firebaseConfig`.
 *
 * Exposes `AuthProvider`, `useAuth`, and `useIsLoggedIn` — the single source of
 * truth for auth state across the web app.
 */

import { createFirebaseAuthContext, useFirebaseAuthJs } from '@sudobility/auth_lib/auth-js';

export type { AuthUser, AuthContextValue } from '@sudobility/auth_lib/auth-js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const { AuthProvider, useAuth, useIsLoggedIn } = createFirebaseAuthContext(
  useFirebaseAuthJs,
  {
    firebaseConfig,
    // Browser: Firebase's own popup flow for Google.
    webPopup: true,
    // raidr offers Google and email/password, no Apple, no guests.
    providers: {
      google: true,
      apple: false,
      emailPassword: true,
      anonymous: false,
    },
    // No guest-first here: a signed-out visitor is simply signed out.
    autoSignInAnonymously: false,
  }
);
