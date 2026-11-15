/**
 * @fileoverview Dashboard shell for /:lang/dashboard/:entitySlug/*.
 *
 * A sidebar with the entity switcher and links (API keys, organizations,
 * members, invitations) beside the selected page. The URL's entity slug is
 * synced into CurrentEntityProvider so the pages act on it.
 */
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrentEntity, useMyInvitations } from '@sudobility/entity_client';
import { Badge, Text } from '@sudobility/components';
import { cn } from '@sudobility/design';
import { Section } from '@sudobility/raidr_ui';
import { useEntityClient } from '@/config/entityClient';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'en', entitySlug = '' } = useParams<{ lang: string; entitySlug: string }>();
  const { entities, selectEntity } = useCurrentEntity();
  const client = useEntityClient();
  const { data: invitations } = useMyInvitations(client);
  const pending = invitations?.length ?? 0;

  useEffect(() => {
    if (entitySlug) selectEntity(entitySlug);
  }, [entitySlug, selectEntity]);

  const base = `/${lang}/dashboard/${entitySlug}`;
  const links = [
    { to: `${base}/api-keys`, label: t('dashboard.apiKeys', 'API keys') },
    { to: `${base}/workspaces`, label: t('dashboard.workspaces', 'Organizations') },
    { to: `${base}/members`, label: t('dashboard.members', 'Members') },
    { to: `${base}/invitations`, label: t('dashboard.invitations', 'Invitations'), badge: pending },
  ];

  return (
    <Section spacing="lg">
      <div className="flex flex-col md:flex-row gap-8 [&>*]:min-w-0">
        <aside className="md:w-60 shrink-0 space-y-4">
          <label className="block">
            <Text size="xs" color="muted" className="mb-1 uppercase tracking-wide">
              {t('dashboard.organization', 'Organization')}
            </Text>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={entitySlug}
              onChange={e => navigate(`/${lang}/dashboard/${e.target.value}/api-keys`)}
            >
              {entities.map(entity => (
                <option key={entity.entitySlug} value={entity.entitySlug}>
                  {entity.displayName}
                </option>
              ))}
            </select>
          </label>
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm whitespace-nowrap',
                    isActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )
                }
              >
                {link.label}
                {link.badge ? (
                  <Badge variant="primary" size="sm" pill>
                    {link.badge}
                  </Badge>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </Section>
  );
}
