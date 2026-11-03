/**
 * @fileoverview `/:lang/login`: the page a visitor navigates to in order to
 * sign in (the top bar's Log in). building_blocks' `LoginPage`, with the same
 * handlers and words as the in-flow modal (`useSignIn`). Once signed in it
 * goes to the dashboard.
 *
 * Sign-in needed in the middle of something else does not come here: those
 * places open `LoginModal` over the page (`SignInProvider`), so there is no
 * `?redirect=` round trip.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { LoginPage as LoginPageComponent } from '@sudobility/building_blocks';
import { EmptyState, Loading } from '@/components/PageState';
import { CONSTANTS } from '@/config/constants';
import { useSignIn } from '@/hooks/useSignIn';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, isLoading: loading } = useAuth();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const destination = `/${lang}/dashboard`;
  const { auth, handlers, viewText, pageHeadings } = useSignIn();

  useEffect(() => {
    if (!loading && user) navigate(destination, { replace: true });
  }, [user, loading, navigate, destination]);

  if (loading) return <Loading />;
  if (!auth) {
    return (
      <EmptyState
        title={t('login.notConfigured', 'Sign-in is not available')}
        description={t(
          'login.notConfiguredHint',
          'Firebase is not configured for this deployment.'
        )}
      />
    );
  }

  return (
    <LoginPageComponent
      appName={CONSTANTS.APP_NAME}
      logo={<img src="/logo.png" alt={CONSTANTS.APP_NAME} className="h-12" />}
      {...handlers}
      text={{ ...viewText, ...pageHeadings }}
      onSuccess={() => navigate(destination, { replace: true })}
    />
  );
}
