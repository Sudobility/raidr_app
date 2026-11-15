import { useTranslation } from 'react-i18next';
import { Card, Heading, Text } from '@sudobility/components';
import { useSkillCatalog } from '@sudobility/raidr_lib';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { EmptyState, ErrorState, Loading, Pagination, SearchBar, Section } from '@sudobility/raidr_ui';
import { useApi } from '@sudobility/building_blocks/firebase';
import { links } from '@/config/links';

/** `/:lang/skills`: searchable skill catalog. */
export default function SkillListPage() {
  const { t } = useTranslation();
  const api = useApi();
  const catalog = useSkillCatalog(api);

  return (
    <Section spacing="lg">
      <Heading level={1} size="3xl" className="mb-2">
        {t('skills.title', 'Skills')}
      </Heading>
      <Text color="muted" className="mb-6">
        {t(
          'skills.subtitle',
          'One SKILL.md per API host: what it does, how to log in and grab a token, and how to connect the MCP server.'
        )}
      </Text>
      <SearchBar
        search={catalog.search}
        onSearch={catalog.setSearch}
        placeholder={t('skills.search', 'Search skills')}
      />
      {catalog.isLoading ? (
        <Loading />
      ) : catalog.error ? (
        <ErrorState error={catalog.error} />
      ) : catalog.items.length === 0 ? (
        <EmptyState title={t('skills.empty', 'No skills yet')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-6 [&>*]:min-w-0">
          {catalog.items.map(skill => (
            <LocalizedLink key={skill.api_host} to={links.skill(skill.name)} className="block">
              <Card
                variant="bordered"
                padding="md"
                className="h-full hover:border-primary transition-colors"
              >
                <Text weight="semibold" truncate>
                  {skill.name}
                </Text>
                <code className="font-mono text-xs text-muted-foreground">{skill.api_host}</code>
                {skill.description ? (
                  <Text size="sm" color="muted" className="mt-2" lineClamp={3}>
                    {skill.description}
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
