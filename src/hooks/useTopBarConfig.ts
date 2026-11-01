import { useMemo, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AuthActionProps,
  AuthMenuItem,
  MenuItemConfig,
  TopBarConfig,
} from '@sudobility/building_blocks';
import { AuthAction, useAuthStatus } from '@sudobility/components/auth';
import { useCurrentEntityOptional } from '@sudobility/entity_client';
import { CubeIcon, DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { LinkWrapper } from '@/components/layout/LinkWrapper';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { isLanguageSupported, SUPPORTED_LANGUAGES } from '@/i18n';

/**
 * Sticky `firebase` top bar: the catalog links, a Sign in button when signed
 * out, and an account menu (API keys, organizations, members, invitations)
 * when signed in. The language selector hides itself while only one language
 * is supported.
 */
export function useTopBarConfig(): TopBarConfig {
  const { t } = useTranslation();
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();
  const { user } = useAuthStatus();
  const entitySlug = useCurrentEntityOptional()?.currentEntitySlug;

  const menuItems: MenuItemConfig[] = useMemo(
    () => [
      { id: 'domains', label: t('nav.domains', 'Domains'), icon: GlobeAltIcon, href: '/domains' },
      { id: 'mcps', label: t('nav.mcps', 'MCP servers'), icon: CubeIcon, href: '/mcps' },
      { id: 'skills', label: t('nav.skills', 'Skills'), icon: DocumentTextIcon, href: '/skills' },
    ],
    [t]
  );

  const authenticatedMenuItems: AuthMenuItem[] = useMemo(() => {
    if (!user) return [];
    const base = entitySlug ? `/dashboard/${entitySlug}` : '/dashboard';
    const go = (section: string) => () => navigate(entitySlug ? `${base}/${section}` : base);
    return [
      { id: 'api-keys', label: t('dashboard.apiKeys', 'API keys'), onClick: go('api-keys') },
      {
        id: 'workspaces',
        label: t('dashboard.workspaces', 'Organizations'),
        onClick: go('workspaces'),
      },
      { id: 'members', label: t('dashboard.members', 'Members'), onClick: go('members') },
      {
        id: 'invitations',
        label: t('dashboard.invitations', 'Invitations'),
        onClick: go('invitations'),
        dividerAfter: true,
      },
    ];
  }, [user, entitySlug, navigate, t]);

  return {
    variant: 'firebase',
    AuthActionComponent: AuthAction as ComponentType<AuthActionProps>,
    // Navigating in order to sign in: the /login page (LoginPage). Sign-in in
    // the middle of something else is the modal (SignInProvider) instead.
    onLoginClick: () => navigate('/login'),
    authenticatedMenuItems,
    logo: { src: '/logo.png', appName: t('app.name', 'raidr'), onClick: () => navigate('/') },
    menuItems,
    currentLanguage,
    onLanguageChange: (lang: string) => {
      if (isLanguageSupported(lang)) switchLanguage(lang);
    },
    hideLanguageSelector: SUPPORTED_LANGUAGES.length < 2,
    collapseBelow: 'md',
    LinkComponent: LinkWrapper,
    sticky: true,
    zIndex: 'highest',
  };
}
