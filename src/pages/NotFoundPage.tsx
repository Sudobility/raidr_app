import { useTranslation } from 'react-i18next';
import { Button, Heading, Text } from '@sudobility/components';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { Section } from '@sudobility/raidr_ui';

/** `/:lang/404`; unknown paths under a language redirect here. */
export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Section spacing="xl">
      <div className="text-center">
        <div className="text-6xl mb-6" aria-hidden="true">
          404
        </div>
        <Heading level={1} size="2xl" className="mb-4">
          {t('errors.notFound.title', 'Page Not Found')}
        </Heading>
        <Text size="lg" color="muted" className="max-w-md mx-auto mb-8">
          {t(
            'errors.notFound.description',
            'The page you are looking for does not exist or has been moved.'
          )}
        </Text>
        <LocalizedLink to="/">
          <Button size="lg">{t('errors.notFound.goHome', 'Go to Home')}</Button>
        </LocalizedLink>
      </div>
    </Section>
  );
}
