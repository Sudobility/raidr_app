import { useTranslation } from 'react-i18next';
import { Badge, Card, Heading, Text } from '@sudobility/components';
import { useMcpCatalog } from '@sudobility/raidr_lib';
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
import { links } from '@/config/links';

/** `/:lang/mcps`: searchable MCP catalog. */
export default function McpListPage() {
  const { t } = useTranslation();
  const api = useApi();
  const catalog = useMcpCatalog(api);

  return (
    <Section spacing="lg">
      <Heading level={1} size="3xl" className="mb-2">
        {t('mcps.title', 'MCP servers')}
      </Heading>
      <Text color="muted" className="mb-6">
        {t('mcps.subtitle', 'One hosted MCP server per API host, generated from observed traffic.')}
      </Text>
      <SearchBar
        search={catalog.search}
        onSearch={catalog.setSearch}
        placeholder={t('mcps.search', 'Search by host or title')}
      />
      {catalog.isLoading ? (
        <Loading />
      ) : catalog.error ? (
        <ErrorState error={catalog.error} />
      ) : catalog.items.length === 0 ? (
        <EmptyState
          title={t('mcps.empty', 'No MCP servers yet')}
          description={t('mcps.emptyHint', 'Publish one with raidr-crawler.')}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-6 [&>*]:min-w-0">
          {catalog.items.map(mcp => (
            <LocalizedLink key={mcp.api_host} to={links.mcp(mcp.api_host)} className="block">
              <Card
                variant="bordered"
                padding="md"
                className="h-full hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <Text weight="semibold" truncate>
                    {mcp.title ?? mcp.api_host}
                  </Text>
                  <Badge variant="info" size="sm" pill>
                    {t('mcps.toolCount', '{{count}} tools', { count: mcp.tool_count })}
                  </Badge>
                </div>
                <code className="font-mono text-xs text-muted-foreground">{mcp.api_host}</code>
                {mcp.description ? (
                  <Text size="sm" color="muted" className="mt-2" lineClamp={2}>
                    {mcp.description}
                  </Text>
                ) : null}
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
