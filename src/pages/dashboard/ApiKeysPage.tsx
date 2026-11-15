/**
 * @fileoverview The current organization's API keys ("raidr_...").
 *
 * A key authenticates as the organization and unlocks full MCP manifests and
 * the hosted MCP server; skills read it from ~/.raidr/config.json. The page
 * body comes from @sudobility/entity_pages, which shows a new key once and
 * limits write controls to owners and managers.
 */
import { useTranslation } from 'react-i18next';
import { ApiKeysPage as ApiKeysPageComponent } from '@sudobility/entity_pages';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Text } from '@sudobility/components';
import { Loading } from '@sudobility/raidr_ui';
import { useEntityClient } from '@/config/entityClient';

export default function ApiKeysPage() {
  const { t } = useTranslation();
  const client = useEntityClient();
  const { currentEntity, isLoading } = useCurrentEntity();
  if (isLoading || !currentEntity) return <Loading />;
  return (
    <div className="space-y-4">
      <Text color="muted">
        {t(
          'dashboard.apiKeysIntro',
          'Use an API key to connect MCP clients to raidr, or paste it when a raidr skill asks for it. Keys belong to the organization, not to you, and are shown only once.'
        )}
      </Text>
      <ApiKeysPageComponent client={client} entity={currentEntity} />
    </div>
  );
}
