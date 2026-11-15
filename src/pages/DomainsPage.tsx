import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Badge, Card, Heading, Text } from '@sudobility/components';
import { useDomains } from '@sudobility/raidr_lib';
import { useApi } from '@sudobility/building_blocks/firebase';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import {
  EmptyState,
  ErrorState,
  Loading,
  Pagination,
  SearchBar,
  Section,
} from '@sudobility/raidr_ui';
import { links } from '@/config/links';

/** `/:lang/domains`: every crawled website; expand one to see the API domains behind it. */
export default function DomainsPage() {
  const { t } = useTranslation();
  const api = useApi();
  const catalog = useDomains(api);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (origin: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(origin)) next.delete(origin);
      else next.add(origin);
      return next;
    });

  return (
    <Section spacing="lg">
      <Heading level={1} size="3xl" className="mb-2">
        {t('domains.title', 'Websites')}
      </Heading>
      <Text color="muted" className="mb-6">
        {t(
          'domains.subtitle',
          'Each website and the API domains it uses. Open an API domain to browse and try its endpoints.'
        )}
      </Text>
      <SearchBar
        search={catalog.search}
        onSearch={catalog.setSearch}
        placeholder={t('domains.search', 'Filter by domain')}
      />
      {catalog.isLoading ? (
        <Loading />
      ) : catalog.error ? (
        <ErrorState error={catalog.error} />
      ) : catalog.domains.length === 0 ? (
        <EmptyState title={t('domains.empty', 'No websites match')} />
      ) : (
        <ul className="mt-6 space-y-2">
          {catalog.domains.map(domain => {
            const expanded = open.has(domain.origin);
            const count = domain.apiHosts.length;
            return (
              <li key={domain.origin}>
                <Card variant="bordered" padding="sm">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 text-left disabled:cursor-default"
                    onClick={() => toggle(domain.origin)}
                    disabled={count === 0}
                    aria-expanded={expanded}
                  >
                    {count === 0 ? (
                      <span className="w-5" />
                    ) : expanded ? (
                      <ChevronDownIcon className="h-5 w-5 shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 shrink-0" />
                    )}
                    <Text weight="semibold" className="min-w-0 truncate flex-1">
                      {domain.domain}
                    </Text>
                    <Badge variant={count > 0 ? 'info' : 'default'} size="sm" pill>
                      {t('domains.apiCount', '{{count}} API domains', { count })}
                    </Badge>
                  </button>
                  {expanded ? (
                    <ul className="mt-3 ml-8 space-y-1">
                      {domain.apiHosts.map(host => (
                        <li key={host}>
                          <LocalizedLink
                            to={links.api(host)}
                            className="font-mono text-sm text-primary underline break-all"
                          >
                            {host}
                          </LocalizedLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
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
