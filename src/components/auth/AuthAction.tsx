/**
 * AuthAction — the top bar's account control, backed by auth_lib (not
 * `@sudobility/components`' auth context, which is going away). Web-specific UI;
 * the shared part is the auth *state* (`useIsLoggedIn` / `useAuth`).
 *
 * Logged out → a "Log in" button. Logged in → an avatar that opens a dropdown
 * of the given menu items plus "Log out".
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@sudobility/components';
// Dropdown is bundled at runtime but not re-exported from the root type barrel
// in this components version; import from the typed subpath.
import { Dropdown } from '@sudobility/components/ui/dropdown';
import type { AuthActionProps } from '@sudobility/building_blocks';
import { useAuth, useIsLoggedIn } from '@/context/AuthContext';

export function AuthAction({
  onLoginClick,
  menuItems = [],
  loginButtonText,
  loginButtonClassName,
}: AuthActionProps) {
  const { t: tAuth } = useTranslation('auth');
  const isLoggedIn = useIsLoggedIn();
  const { user, signOut } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <Button onClick={onLoginClick} className={loginButtonClassName}>
        {loginButtonText ?? tAuth('login', 'Log In')}
      </Button>
    );
  }

  const initials = (user.email ?? user.displayName ?? '?').slice(0, 2).toUpperCase();

  const items = [
    ...menuItems.map(m => ({
      id: m.id,
      label: m.label,
      onClick: () => m.onClick?.(),
    })),
    {
      id: 'logout',
      label: tAuth('logout', 'Log out'),
      onClick: () => {
        void signOut();
      },
    },
  ];

  return (
    <Dropdown
      items={items}
      trigger={
        <button
          type="button"
          aria-label={user.email ?? tAuth('account', 'Account')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {initials}
        </button>
      }
    />
  );
}
