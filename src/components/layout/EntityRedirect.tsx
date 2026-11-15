/**
 * @fileoverview /:lang/dashboard → /:lang/dashboard/:entitySlug/api-keys for the current entity.
 *
 * CurrentEntityProvider (entity_client, mounted by the app shell) picks the
 * last-used entity or the personal one; this waits for it and redirects.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Button } from '@sudobility/components';
import { EmptyState, Loading } from '@sudobility/raidr_ui';

export default function EntityRedirect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { currentEntity, isLoading, isInitialized, error, refresh } = useCurrentEntity();

  useEffect(() => {
    if (isLoading || !isInitialized || !currentEntity) return;
    navigate(`/${lang ?? 'en'}/dashboard/${currentEntity.entitySlug}/api-keys`, { replace: true });
  }, [currentEntity, isLoading, isInitialized, navigate, lang]);

  if (error) {
    return (
      <div className="text-center">
        <EmptyState
          title={t('dashboard.loadFailed', 'Could not load your organizations')}
          description={error.message}
        />
        <Button variant="outline" onClick={() => refresh()}>
          {t('errorBoundary.tryAgain', 'Try again')}
        </Button>
      </div>
    );
  }
  return <Loading />;
}
