import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, Heading, Text } from '@sudobility/components';
import { useApiInspector } from '@sudobility/raidr_lib';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useAuthStatus } from '@sudobility/components/auth';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { Section } from '@/components/layout/Section';
import { EmptyState, ErrorState, Loading } from '@/components/PageState';
import { SignInPrompt } from '@/components/SignInPrompt';
import { MethodBadge } from '@/components/api/MethodBadge';
import { AuthBadge } from '@/components/api/AuthBadge';
import { links } from '@/config/links';
import { FlowMap } from '@/components/api/FlowMap';

/** `/:lang/api?domain={apiHost}`: one API domain's endpoints, with links to its MCP server and skill. */
export default function ApiPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const apiHost = params.get('domain') ?? '';
  const api = useApi();
  const { user, loading: authLoading } = useAuthStatus();
  // Group tiles on the flow map that list every member.
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = useCallback(
    (id: string) =>
      setExpandedGroups(current =>
        current.includes(id) ? current.filter(g => g !== id) : [...current, id]
      ),
    []
  );
  const inspector = useApiInspector({
    ...api,
    apiHost,
    isAuthenticated: !!user && !user.isAnonymous,
    flowOptions: {
      loginLabel: t('flow.login', 'Log in'),
      groupLabel: t('flow.group', 'Uses {{param}}', { param: '{{param}}' }),
      expandedGroups,
    },
  });

  if (inspector.isLoading || authLoading) return <Loading />;
  if (inspector.error) return <ErrorState error={inspector.error} />;

  const header = (
    <Section spacing="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Text size="sm" color="muted">
            {t('api.kicker', 'API domain')}
          </Text>
          <Heading level={1} size="3xl" className="font-mono break-all">
            {apiHost}
          </Heading>
          {inspector.summary?.description ? (
            <Text color="muted" className="mt-2 max-w-3xl">
              {inspector.summary.description}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {inspector.hasMcp ? (
            <LocalizedLink to={links.mcp(apiHost)}>
              <Button variant="outline">{t('api.mcpLink', 'MCP')}</Button>
            </LocalizedLink>
          ) : null}
          {inspector.skillSlug ? (
            <LocalizedLink to={links.skill(inspector.skillSlug)}>
              <Button variant="outline">{t('api.skillLink', 'Skill')}</Button>
            </LocalizedLink>
          ) : null}
        </div>
      </div>
    </Section>
  );

  if (inspector.notFound || !inspector.summary) {
    return (
      <>
        {header}
        <EmptyState
          title={t('api.notFound', 'No endpoint documentation for {{host}} yet', { host: apiHost })}
        />
      </>
    );
  }

  return (
    <>
      {header}
      {inspector.requiresSignIn || !inspector.doc ? (
        <Section spacing="md">
          <SignInPrompt
            title={t('api.signInTitle', 'Sign in to browse and try the endpoints')}
            description={t(
              'api.signInDescription',
              'Endpoint documentation and the request playground are available to signed-in users. It is free to sign up.'
            )}
          />
        </Section>
      ) : (
        <>
          <Section spacing="md">
            <Heading level={2} size="2xl" className="mb-2">
              {t('api.flowTitle', 'How the endpoints connect')}
            </Heading>
            <Text color="muted" className="mb-4 max-w-3xl">
              {t(
                'api.flowSubtitle',
                'Which calls supply the data (ids, tokens) other calls need. Click a tile to open it.'
              )}
            </Text>
            <FlowMap graph={inspector.flow} onToggleGroup={toggleGroup} />
          </Section>
          <Section spacing="md">
            <Heading level={2} size="2xl" className="mb-4">
              {t('api.endpointsTitle', 'Endpoints ({{count}})', {
                count: inspector.doc.endpoints.length,
              })}
            </Heading>
            <div className="space-y-6">
              {inspector.groups.map(group => (
                <div key={group.tag}>
                  <Text weight="semibold" className="mb-2 capitalize">
                    {group.tag}
                  </Text>
                  <Card variant="bordered" padding="none">
                    <ul className="divide-y divide-border">
                      {group.items.map(({ endpoint, ref }) => (
                        <li key={endpoint.id}>
                          <LocalizedLink
                            to={links.endpoint(ref)}
                            className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <MethodBadge method={endpoint.method} />
                            <code className="font-mono text-sm break-all min-w-0 flex-1">
                              {endpoint.path}
                            </code>
                            <Text size="sm" color="muted" className="hidden md:block">
                              {endpoint.summary}
                            </Text>
                            <AuthBadge auth={endpoint.auth} />
                          </LocalizedLink>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              ))}
            </div>
            <Badge variant="default" size="sm" className="mt-6">
              {t('api.version', 'Version {{v}}', { v: inspector.doc.version })}
            </Badge>
          </Section>
        </>
      )}
    </>
  );
}
