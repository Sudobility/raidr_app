import { useTranslation } from 'react-i18next';
import { Badge, Card, Heading, Text } from '@sudobility/components';
import { useSiteCatalog } from '@sudobility/raidr_lib';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import {
  EmptyState,
  ErrorState,
  Loading,
  Pagination,
  SearchBar,
  Section,
} from '@sudobility/raidr_ui';
import { useApi } from '@sudobility/building_blocks/firebase';

/** `/:lang/sites`: searchable list of crawled sites. */
export default function SiteListPage() {
  const { t } = useTranslation();
  const api = useApi();
  const catalog = useSiteCatalog(api);

  return (
    <Section spacing="lg">
      <Heading level={1} size="3xl" className="mb-2">
        {t('sites.title', 'Sites')}
      </Heading>
      <Text color="muted" className="mb-6">
        {t('sites.subtitle', 'Crawled websites and the API hosts they were seen calling.')}
      </Text>
      <SearchBar
        search={catalog.search}
        onSearch={catalog.setSearch}
        placeholder={t('sites.search', 'Search by origin')}
      />
      {catalog.isLoading ? (
        <Loading />
      ) : catalog.error ? (
        <ErrorState error={catalog.error} />
      ) : catalog.items.length === 0 ? (
        <EmptyState title={t('sites.empty', 'No sites yet')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-6 [&>*]:min-w-0">
          {catalog.items.map(site => (
            <LocalizedLink
              key={site.origin}
              to={`/sites/${encodeURIComponent(site.origin)}`}
              className="block"
            >
              <Card
                variant="bordered"
                padding="md"
                className="h-full hover:border-primary transition-colors"
              >
                <Text weight="semibold" truncate>
                  {site.title ?? site.origin}
                </Text>
                <code className="font-mono text-xs text-muted-foreground">{site.origin}</code>
                <div className="flex flex-wrap gap-1 mt-2">
                  {site.api_hosts.map(host => (
                    <Badge key={host} variant="default" size="sm">
                      {host}
                    </Badge>
                  ))}
                </div>
              </Card>
            </LocalizedLink>
          ))}
        </div>
      )}
      <Pagination
        page={catalog.page}
        pageCount={catalog.pageCount}
        totalCount={catalog.totalCount}
        hasNextPage={catalog.hasNextPage}
        hasPreviousPage={catalog.hasPreviousPage}
        onPage={catalog.setPage}
      />
    </Section>
  );
}
