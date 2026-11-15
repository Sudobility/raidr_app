import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Heading, Text } from '@sudobility/components';
import { useSite } from '@sudobility/raidr_lib';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { EmptyState, ErrorState, Loading, Section } from '@sudobility/raidr_ui';
import { useApi } from '@sudobility/building_blocks/firebase';
import { links } from '@/config/links';

/** `/:lang/sites/:origin`; the router decodes the URL-encoded origin. */
export default function SiteDetailPage() {
  const { t } = useTranslation();
  const { origin = '' } = useParams();
  const api = useApi();
  const { site, apiHosts, isLoading, notFound, error } = useSite({ ...api, origin });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (notFound || !site) {
    return <EmptyState title={t('site.notFound', 'No record for {{origin}}', { origin })} />;
  }

  return (
    <Section spacing="lg">
      <Heading level={1} size="3xl">
        {site.title ?? site.origin}
      </Heading>
      <a
        href={site.origin}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-sm text-primary underline"
      >
        {site.origin}
      </a>
      {site.description ? (
        <Text color="muted" className="mt-3 max-w-3xl">
          {site.description}
        </Text>
      ) : null}
      {site.last_crawled_at ? (
        <Text size="sm" color="muted" className="mt-2">
          {t('site.lastCrawled', 'Last crawled {{when}}', {
            when: new Date(site.last_crawled_at).toLocaleString(),
          })}
        </Text>
      ) : null}
      <Heading level={2} size="xl" className="mt-8 mb-3">
        {t('site.apiHosts', 'API hosts')}
      </Heading>
      {apiHosts.length === 0 ? (
        <Text color="muted">{t('site.noHosts', 'No API hosts recorded.')}</Text>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
          {apiHosts.map(host => (
            <LocalizedLink key={host} to={links.api(host)} className="block">
              <Card
                variant="bordered"
                padding="md"
                className="hover:border-primary transition-colors"
              >
                <code className="font-mono">{host}</code>
              </Card>
            </LocalizedLink>
          ))}
        </div>
      )}
    </Section>
  );
}
