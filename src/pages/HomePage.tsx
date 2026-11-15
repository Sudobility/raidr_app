import { useTranslation } from 'react-i18next';
import { Button, Card, Heading, Text } from '@sudobility/components';
import { useRaidrMcps, useRaidrSites, useRaidrSkills } from '@sudobility/raidr_client';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { CopyBlock, Section } from '@sudobility/raidr_ui';
import { useApi } from '@sudobility/building_blocks/firebase';
import { CONSTANTS } from '@/config/constants';

/** Linked count card; `—` until the count loads or if it fails. */
function Stat({
  label,
  value,
  to,
}: {
  label: string;
  value: number | null | undefined;
  to: string;
}) {
  return (
    <LocalizedLink to={to} className="block">
      <Card variant="bordered" padding="md" className="h-full">
        <Text size="3xl" weight="bold">
          {value ?? '—'}
        </Text>
        <Text color="muted">{label}</Text>
      </Card>
    </LocalizedLink>
  );
}

/**
 * Landing page. Reads raidr_client hooks directly with `limit: 1`, only to
 * get each catalog's `pagination.totalCount`; errors are not surfaced.
 */
export default function HomePage() {
  const { t } = useTranslation();
  const { networkClient, baseUrl } = useApi();
  const mcps = useRaidrMcps(networkClient, baseUrl, { limit: 1 });
  const skills = useRaidrSkills(networkClient, baseUrl, { limit: 1 });
  const sites = useRaidrSites(networkClient, baseUrl, { limit: 1 });

  return (
    <>
      <Section spacing="xl">
        <Heading level={1} size="4xl" className="mb-4">
          {t('home.title', 'MCP servers for any website')}
        </Heading>
        <Text size="lg" color="muted" className="max-w-2xl">
          {t(
            'home.subtitle',
            'raidr crawls a site, reads the JavaScript it ships, and turns the APIs it calls into a hosted MCP server plus an agent skill that explains how to get a token. Bring your own login; the tools do the rest.'
          )}
        </Text>
        <div className="flex flex-wrap gap-3 mt-6">
          <LocalizedLink to="/mcps">
            <Button size="lg">{t('home.browseMcps', 'Browse MCP servers')}</Button>
          </LocalizedLink>
          <LocalizedLink to="/skills">
            <Button size="lg" variant="outline">
              {t('home.browseSkills', 'Browse skills')}
            </Button>
          </LocalizedLink>
        </div>
      </Section>
      <Section spacing="md">
        <div className="grid gap-4 sm:grid-cols-3 [&>*]:min-w-0">
          <Stat
            label={t('nav.mcps', 'MCP servers')}
            value={mcps.data?.pagination.totalCount}
            to="/mcps"
          />
          <Stat
            label={t('nav.skills', 'Skills')}
            value={skills.data?.pagination.totalCount}
            to="/skills"
          />
          <Stat
            label={t('nav.sites', 'Sites')}
            value={sites.data?.pagination.totalCount}
            to="/sites"
          />
        </div>
      </Section>
      <Section spacing="lg">
        <Heading level={2} size="2xl" className="mb-3">
          {t('home.howTitle', 'How a connection works')}
        </Heading>
        <ol className="list-decimal pl-6 space-y-2 max-w-2xl">
          <li>
            {t(
              'home.how1',
              'Pick an API host. Its page lists every tool and the request each one makes.'
            )}
          </li>
          <li>
            {t(
              'home.how2',
              'Open the matching skill to see exactly where to copy your token from after logging in to the site.'
            )}
          </li>
          <li>
            {t(
              'home.how3',
              'Add the endpoint to your MCP client with the token in the X-Raidr-Token header.'
            )}
          </li>
        </ol>
        <CopyBlock
          code={`claude mcp add --transport http <name> ${CONSTANTS.API_URL}/mcp/<api-host> --header "X-Raidr-Token: <token>"`}
          title={t('home.example', 'Example')}
        />
      </Section>
    </>
  );
}
