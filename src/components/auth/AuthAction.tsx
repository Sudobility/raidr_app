/**
 * AuthAction — the top bar's account control, backed by auth_lib. The
 * dropdown/menu/sign-out rendering now lives in `building_blocks`'
 * `AuthActionView`; this adapter binds the app's auth *state*
 * (`useIsLoggedIn` / `useAuth`) and supplies the local initials avatar.
 */
import { useTranslation } from 'react-i18next';
import { AuthActionView } from '@sudobility/building_blocks';
import type { AuthActionProps, AuthActionUser } from '@sudobility/building_blocks';
import { useAuth, useIsLoggedIn } from '@/context/AuthContext';

export function AuthAction(props: AuthActionProps) {
  const { t: tAuth } = useTranslation('auth');
  const isLoggedIn = useIsLoggedIn();
  const { user, signOut } = useAuth();

  const renderAvatar = (u: AuthActionUser) => (
    <button
      type="button"
      aria-label={u.email ?? tAuth('account', 'Account')}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-80 transition-opacity"
    >
      {(u.email ?? u.displayName ?? '?').slice(0, 2).toUpperCase()}
    </button>
  );

  return (
    <AuthActionView
      {...props}
      user={isLoggedIn ? user : null}
      onSignOut={() => void signOut()}
      signOutLabel={tAuth('logout', 'Log out')}
      loginButtonText={props.loginButtonText ?? tAuth('login', 'Log In')}
      renderAvatar={renderAvatar}
    />
  );
}
