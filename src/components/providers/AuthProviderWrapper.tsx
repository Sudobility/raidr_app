/**
 * @fileoverview Firebase Auth provider with i18n texts (from shapeshyft_app).
 *
 * Firebase is required: di_web initializes the Firebase app from the
 * VITE_FIREBASE_* config (Analytics), and building_blocks' Firebase shell,
 * ApiProvider and useAuthStatus all need an AuthProvider. When the config is
 * missing, this renders a plain configuration notice instead of letting the
 * tree crash into a blank page.
 */
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '@sudobility/components/auth';
import {
  getFirebaseAuth,
  getFirebaseErrorMessage,
  initializeFirebaseAuth,
  isFirebaseConfigured,
} from '@sudobility/auth_lib';
import { createAuthErrorTexts, createAuthTexts } from '@/config/auth-config';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

/** Shown instead of the app when the deployment has no Firebase config. */
function FirebaseNotConfigured() {
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold">raidr is not configured</h1>
        <p className="text-muted-foreground">
          This deployment is missing its Firebase configuration. Set the VITE_FIREBASE_* variables
          (see .env.example) and rebuild.
        </p>
      </div>
    </div>
  );
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  const { t } = useTranslation(['auth', 'common']);
  const texts = useMemo(() => createAuthTexts(t), [t]);
  const errorTexts = useMemo(() => createAuthErrorTexts(), []);

  // di_web creates the Firebase app only when the config is complete; auth_lib
  // throws if there is none, which would unmount the whole tree.
  if (!isFirebaseConfigured()) {
    console.error('[AuthProviderWrapper] Firebase is not configured; set VITE_FIREBASE_*');
    return <FirebaseNotConfigured />;
  }
  initializeFirebaseAuth(); // idempotent
  const auth = getFirebaseAuth();
  if (!auth) return <FirebaseNotConfigured />;

  return (
    <AuthProvider
      firebaseConfig={{ type: 'instance', auth }}
      providerConfig={{ providers: ['google', 'email'], enableAnonymous: false }}
      texts={texts}
      errorTexts={errorTexts}
      resolveErrorMessage={getFirebaseErrorMessage}
    >
      {children}
    </AuthProvider>
  );
}
