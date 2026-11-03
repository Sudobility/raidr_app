import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Heading, Text, TextArea } from '@sudobility/components';
import { useEndpointPlayground } from '@sudobility/raidr_lib';
import { isApiEndpointV2, type ApiParamLocation } from '@sudobility/raidr_types';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useAuth } from '@/context/AuthContext';
import { LocalizedLink } from '@/components/layout/LocalizedLink';
import { Section } from '@/components/layout/Section';
import { EmptyState, ErrorState, Loading } from '@/components/PageState';
import { SignInPrompt } from '@/components/SignInPrompt';
import { CopyBlock } from '@/components/CopyBlock';
import { MethodBadge } from '@/components/api/MethodBadge';
import { AuthBadge } from '@/components/api/AuthBadge';
import { ParamField } from '@/components/api/ParamField';
import { CredentialPanel } from '@/components/api/CredentialPanel';
import { ResponseView } from '@/components/api/ResponseView';
import { SchemaTree } from '@/components/api/SchemaTree';
import { links } from '@/config/links';

const LOCATIONS: ApiParamLocation[] = ['path', 'query', 'header', 'body'];

/** `/:lang/endpoint?endpoint={METHOD https://host/path}`: docs, inputs, Execute, result. */
export default function EndpointPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const ref = params.get('endpoint') ?? '';
  const api = useApi();
  const { user, isLoading: authLoading } = useAuth();
  const pg = useEndpointPlayground({
    ...api,
    endpointRef: ref,
    isAuthenticated: !!user && !user.isAnonymous,
  });

  if (pg.isLoading || authLoading) return <Loading />;
  if (pg.error) return <ErrorState error={pg.error} />;
  if (pg.requiresSignIn) {
    return (
      <Section spacing="lg">
        <SignInPrompt
          title={t('endpoint.signInTitle', 'Sign in to try this endpoint')}
          description={t(
            'endpoint.signInDescription',
            'The playground runs requests through raidr for signed-in users. It is free to sign up.'
          )}
        />
      </Section>
    );
  }
  if (pg.notFound || !pg.endpoint || !pg.doc || !pg.form) {
    return <EmptyState title={t('endpoint.notFound', 'Endpoint not found')} description={ref} />;
  }

  const { endpoint, doc, form } = pg;
  // Version 2 documents the body's full shape; shown above its fields.
  const bodySchema = isApiEndpointV2(endpoint) ? endpoint.input.properties.body : undefined;
  const labelOf: Record<ApiParamLocation, string> = {
    path: t('endpoint.loc.path', 'Path parameters'),
    query: t('endpoint.loc.query', 'Query parameters'),
    header: t('endpoint.loc.header', 'Headers'),
    body: t('endpoint.loc.body', 'Request body'),
  };
  const shownError = (name: string) =>
    pg.showAllErrors || pg.touched[name] ? (pg.errors[name] ?? null) : null;

  return (
    <>
      <Section spacing="lg">
        <LocalizedLink to={links.api(doc.apiHost)} className="text-sm text-primary underline">
          ← {doc.apiHost}
        </LocalizedLink>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <Heading level={1} size="2xl" className="font-mono break-all">
            {endpoint.path}
          </Heading>
          <AuthBadge auth={endpoint.auth} />
        </div>
        <Text className="mt-2">{endpoint.summary}</Text>
        {endpoint.description ? (
          <Text color="muted" className="mt-1">
            {endpoint.description}
          </Text>
        ) : null}
        <code className="mt-2 block font-mono text-xs text-muted-foreground break-all">
          {doc.baseUrl}
          {endpoint.path}
        </code>
      </Section>

      {endpoint.auth !== 'none' ? (
        <Section spacing="sm">
          <Heading level={2} size="xl" className="mb-3">
            {t('endpoint.authTitle', 'Authentication')}
          </Heading>
          <Card variant="bordered" padding="md">
            <CredentialPanel
              auth={endpoint.auth}
              doc={doc}
              userToken={pg.userToken}
              onUserToken={pg.setUserToken}
              apiKey={pg.apiKey}
              onApiKey={pg.setApiKey}
              remember={pg.remember}
              onRemember={pg.setRemember}
              onOpenLogin={pg.openLogin}
              loginWindow={pg.loginWindow}
              extension={pg.extension}
              tokenVerified={pg.tokenVerified}
            />
          </Card>
        </Section>
      ) : null}

      <Section spacing="sm">
        <Heading level={2} size="xl" className="mb-3">
          {t('endpoint.paramsTitle', 'Parameters')}
        </Heading>
        {form.params.length === 0 && form.rawBody === 'none' ? (
          <Text color="muted">{t('endpoint.noParams', 'This endpoint takes no parameters.')}</Text>
        ) : (
          <div className="space-y-4">
            {LOCATIONS.map(location => {
              const list = form.params.filter(p => p.in === location);
              const extra = location === 'body' && form.rawBody !== 'none';
              const whole = form.rawBody === 'whole';
              if (list.length === 0 && !extra) return null;
              return (
                <Card key={location} variant="bordered" padding="md">
                  <Text weight="semibold" className="mb-1">
                    {labelOf[location]}
                  </Text>
                  {location === 'body' && bodySchema && (whole || list.length > 0) ? (
                    <details className="mb-2">
                      <summary className="cursor-pointer text-sm text-primary">
                        {t('endpoint.bodySchema', 'Body structure')}
                      </summary>
                      <div className="mt-2">
                        <SchemaTree schema={bodySchema} />
                      </div>
                    </details>
                  ) : null}
                  {list.map(param => (
                    <ParamField
                      key={param.name}
                      param={param}
                      value={pg.values[param.name] ?? ''}
                      onChange={raw => pg.setValue(param.name, raw)}
                      error={shownError(param.name)}
                    />
                  ))}
                  {extra ? (
                    <div className="pt-3">
                      <Text size="sm" weight="medium">
                        {whole
                          ? t('endpoint.wholeBody', 'Body (JSON)')
                          : list.length > 0
                            ? t('endpoint.extraBody', 'More body fields (JSON)')
                            : t('endpoint.rawBody', 'Body fields (JSON)')}
                      </Text>
                      <Text size="xs" color="muted" className="mb-2">
                        {whole
                          ? t(
                              'endpoint.wholeBodyHint',
                              'The whole request body as JSON, shaped as described above.'
                            )
                          : t(
                              'endpoint.extraBodyHint',
                              'The fields this endpoint accepts are not all documented. Add any as a JSON object.'
                            )}
                      </Text>
                      <TextArea
                        value={pg.extraBody}
                        onChange={pg.setExtraBody}
                        rows={whole ? 8 : 5}
                        placeholder={whole ? '[ … ]' : '{ "field": "value" }'}
                        className="font-mono text-sm"
                      />
                      {shownError('extraBody') ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">
                          {shownError('extraBody')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {endpoint.responses.length > 0 ? (
        <Section spacing="sm">
          <Heading level={2} size="xl" className="mb-3">
            {t('endpoint.responsesTitle', 'Responses')}
          </Heading>
          <div className="space-y-3">
            {endpoint.responses.map(response => (
              <Card key={response.status} variant="bordered" padding="md">
                <Text weight="semibold">
                  {response.status}
                  {response.contentType ? (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {response.contentType}
                    </span>
                  ) : null}
                </Text>
                {response.description ? (
                  <Text size="sm" color="muted" className="mt-1">
                    {response.description}
                  </Text>
                ) : null}
                {'schema' in response && response.schema ? (
                  <div className="mt-2">
                    <SchemaTree schema={response.schema} />
                  </div>
                ) : 'fields' in response && response.fields?.length ? (
                  <Text size="sm" color="muted" className="mt-1">
                    {t('endpoint.fields', 'Fields: {{fields}}', {
                      fields: response.fields.join(', '),
                    })}
                  </Text>
                ) : null}
                {response.example ? (
                  <CopyBlock
                    code={response.example}
                    language="json"
                    title={t('endpoint.example', 'Example')}
                  />
                ) : null}
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      <Section spacing="md">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={pg.execute} disabled={pg.isExecuting}>
            {pg.isExecuting
              ? t('endpoint.executing', 'Running…')
              : t('endpoint.execute', 'Execute')}
          </Button>
          <Button variant="ghost" onClick={pg.reset} disabled={pg.isExecuting}>
            {t('endpoint.reset', 'Clear')}
          </Button>
          {pg.missingCredential === 'user' ? (
            <Text size="sm" color="muted">
              {t('endpoint.noToken', 'No token entered: the API will likely answer 401.')}
            </Text>
          ) : pg.missingCredential === 'api_key' ? (
            <Text size="sm" color="muted">
              {t('endpoint.noKey', 'No API key entered: the API will likely refuse the request.')}
            </Text>
          ) : null}
        </div>
        {pg.showAllErrors && Object.keys(pg.errors).length > 0 ? (
          <Alert variant="warning" className="mt-4">
            {t('endpoint.fixErrors', 'Fix the highlighted fields first.')}
          </Alert>
        ) : null}
        <div className="mt-6">
          {pg.executeError ? (
            <Alert variant="error" title={t('endpoint.failed', 'The request could not be run')}>
              {pg.executeError.message}
            </Alert>
          ) : null}
          {pg.result ? <ResponseView result={pg.result} /> : null}
        </div>
      </Section>
    </>
  );
}
