/**
 * @fileoverview Requires a signed-in user for the dashboard, without leaving
 * the page: a signed-out visitor sees a sign-in prompt where the dashboard
 * would be, and the sign-in modal opens over it on arrival. Signing in renders
 * the dashboard at the same URL; closing the modal leaves the prompt, whose
 * button opens it again. There is no redirect to `/login`.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/PageState';
import { SignInPrompt } from '@/components/SignInPrompt';
import { Section } from '@/components/layout/Section';
import { useSignInModal } from '@/components/auth/signInContext';

/** Wraps dashboard routes. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user, isLoading: loading } = useAuth();
  const { openSignIn } = useSignInModal();
  const signedOut = !loading && !user;
  const asked = useRef(false);

  // Ask once per visit; after a close the prompt's button is the way back in.
  useEffect(() => {
    if (signedOut && !asked.current) {
      asked.current = true;
      openSignIn();
    }
  }, [signedOut, openSignIn]);

  if (loading) return <Loading />;
  if (!user) {
    return (
      <Section spacing="lg">
        <SignInPrompt
          title={t('dashboard.signInTitle', 'Sign in to open your dashboard')}
          description={t(
            'dashboard.signInDescription',
            'Your organizations, members, invitations and API keys are here once you are signed in. It is free to sign up.'
          )}
        />
      </Section>
    );
  }
  return <>{children}</>;
}
