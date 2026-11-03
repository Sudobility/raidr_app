import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Badge, Button, Heading, Text } from '@sudobility/components';
import { useMcp, useSiteCatalog } from '@sudobility/raidr_lib';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { Section } from '@/components/layout/Section';
import { EmptyState, ErrorState, Loading } from '@/components/PageState';
import { ToolsTable } from '@/components/ToolsTable';
import { ConnectDocs } from '@/components/ConnectDocs';
import { SignInPrompt } from '@/components/SignInPrompt';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useAuth } from '@/context/AuthContext';
import { links } from '@/config/links';

/**
 * `/:lang/mcps?domain={apiHost}`. Everyone sees the public summary; signed-in users
 * also get the tools and connection setup, everyone else a sign-in prompt.
 * The typed API key and site token only rebuild the snippets via useMcp.
 */
export default function McpDetailPage({ apiHost }: { apiHost: string }) {
  const { t } = useTranslation();
  const { networkClient, baseUrl } = useApi();
  const { user, isLoading: authLoading } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [siteToken, setSiteToken] = useState('');
  const { summary, manifest, tools, skill, connect, requiresSignIn, isLoading, notFound, error } =
    useMcp({
      networkClient,
      baseUrl,
      apiHost,
      isAuthenticated: !!user && !user.isAnonymous,
      apiKey,
      siteToken,
    });
  const sites = useSiteCatalog({ networkClient, baseUrl, apiHost });

  if (isLoading || authLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (notFound || !summary) {
    return (
      <EmptyState title={t('mcp.notFound', 'No MCP published for {{host}}', { host: apiHost })} />
    );
  }

  return (
    <>
      <Section spacing="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Heading level={1} size="3xl">
              {summary.title ?? summary.api_host}
            </Heading>
            <code className="font-mono text-sm text-muted-foreground">{summary.api_host}</code>
            {summary.description ? (
              <Text color="muted" className="mt-3 max-w-3xl">
                {summary.description}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <LocalizedLink to={links.api(apiHost)}>
              <Button size="sm" variant="outline">
                {t('mcp.apiLink', 'API')}
              </Button>
            </LocalizedLink>
            {skill ? (
              <LocalizedLink to={links.skill(skill.name)}>
                <Button size="sm" variant="outline">
                  {t('mcp.skillLink', 'Skill')}
                </Button>
              </LocalizedLink>
            ) : null}
            {manifest ? (
              <Badge variant="default" pill>
                {t('mcp.auth', 'auth: {{style}}', { style: manifest.auth.style })}
              </Badge>
            ) : null}
            <Badge variant="info" pill>
              {t('mcps.toolCount', '{{count}} tools', { count: summary.tool_count })}
            </Badge>
            {summary.version ? (
              <Badge variant="default" pill>
                v{summary.version}
              </Badge>
            ) : null}
          </div>
        </div>
        {skill ? (
          <Alert
            variant="info"
            className="mt-6"
            title={t('mcp.skillTitle', 'A skill explains how to get a token for this API')}
          >
            <LocalizedLink to={links.skill(skill.name)}>
              <Button size="sm" variant="outline">
                {t('mcp.openSkill', 'Open the skill')}
              </Button>
            </LocalizedLink>
          </Alert>
        ) : null}
      </Section>

      {requiresSignIn || !manifest ? (
        <Section spacing="md">
          <SignInPrompt />
        </Section>
      ) : (
        <>
          <Section spacing="md">
            <Heading level={2} size="2xl" className="mb-4">
              {t('mcp.connectTitle', 'Connect')}
            </Heading>
            <ConnectDocs
              connect={connect}
              needsSiteToken={manifest.auth.style !== 'none'}
              onApiKeyChange={setApiKey}
              onSiteTokenChange={setSiteToken}
            />
          </Section>

          <Section spacing="md">
            <Heading level={2} size="2xl" className="mb-4">
              {t('mcp.toolsTitle', 'Tools')}
            </Heading>
            <ToolsTable tools={tools} />
          </Section>

          <Section spacing="md">
            <Heading level={2} size="xl" className="mb-3">
              {t('mcp.sitesTitle', 'Sites using this API')}
            </Heading>
            {sites.items.length === 0 ? (
              <Text color="muted">{t('mcp.noSites', 'None recorded yet.')}</Text>
            ) : (
              <ul className="space-y-1">
                {sites.items.map(site => (
                  <li key={site.origin}>
                    <LocalizedLink
                      to={`/sites/${encodeURIComponent(site.origin)}`}
                      className="text-primary underline"
                    >
                      {site.title ?? site.origin}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            )}
            <Text size="xs" color="muted" className="mt-6">
              {t('mcp.source', 'Generated {{when}} from {{bundle}} by raidr-crawler {{version}}.', {
                when: new Date(manifest.generatedAt).toLocaleDateString(),
                bundle: manifest.source.bundleName,
                version: manifest.source.crawlerVersion,
              })}
            </Text>
          </Section>
        </>
      )}
    </>
  );
}
