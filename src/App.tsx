/**
 * @fileoverview Root component and route table.
 *
 * SudobilityAppWithFirebaseAuthAndEntities supplies the providers: i18n,
 * theme, TanStack Query, toasts, router, the Firebase Analytics page tracker,
 * Firebase Auth (through AuthProviderWrapper), the API context (`useApi()`:
 * a network client that adds the signed-in user's token), and
 * CurrentEntityProvider for the selected organization. There is no
 * subscription provider yet (pricing comes later). Every page lives under
 * `/:lang`; the dashboard requires sign-in (asked in place, not by redirect).
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { SudobilityAppWithFirebaseAuthAndEntities } from '@sudobility/building_blocks/firebase';
import { LanguageRedirect, LanguageValidator } from '@sudobility/components';
import { SEOHead, SEOHeadProvider } from '@sudobility/seo_lib';
import i18n, { isLanguageSupported } from './i18n';
import { seoHeadConfig } from './seoHead';
import { AuthProviderWrapper } from './components/providers/AuthProviderWrapper';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { SignInProvider } from './components/auth/SignInProvider';
import { CONSTANTS } from './config/constants';
import ScreenContainer from './components/layout/ScreenContainer';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Loading } from './components/PageState';
import { useDocumentLanguage } from './hooks/useDocumentLanguage';
import { links, skillSlugFor } from './config/links';

const HomePage = lazy(() => import('./pages/HomePage'));
const McpListPage = lazy(() => import('./pages/McpListPage'));
const McpDetailPage = lazy(() => import('./pages/McpDetailPage'));
const SkillListPage = lazy(() => import('./pages/SkillListPage'));
const SkillDetailPage = lazy(() => import('./pages/SkillDetailPage'));
const SiteListPage = lazy(() => import('./pages/SiteListPage'));
const DomainsPage = lazy(() => import('./pages/DomainsPage'));
const ApiPage = lazy(() => import('./pages/ApiPage'));
const EndpointPage = lazy(() => import('./pages/EndpointPage'));
const SiteDetailPage = lazy(() => import('./pages/SiteDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const EntityRedirect = lazy(() => import('./components/layout/EntityRedirect'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const ApiKeysPage = lazy(() => import('./pages/dashboard/ApiKeysPage'));
const WorkspacesPage = lazy(() => import('./pages/dashboard/WorkspacesPage'));
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'));
const InvitationsPage = lazy(() => import('./pages/dashboard/InvitationsPage'));

/** Keeps `<html lang/dir>` in step with the active language. */
function DocumentLanguageSync({ children }: { children: ReactNode }) {
  useDocumentLanguage();
  return <>{children}</>;
}

/** `/mcps` is the browser; `/mcps?domain={apiHost}` the inspector. */
function McpsRoute() {
  const [params] = useSearchParams();
  const domain = params.get('domain');
  return domain ? <McpDetailPage apiHost={domain} /> : <McpListPage />;
}

/** `/skills` is the browser; `/skills?skill={slug}` the inspector. */
function SkillsRoute() {
  const [params] = useSearchParams();
  const slug = params.get('skill');
  return slug ? <SkillDetailPage slug={slug} /> : <SkillListPage />;
}

/** Old `/mcps/:apiHost` links. */
function LegacyMcpRedirect() {
  const { lang = 'en', apiHost = '' } = useParams();
  return <Navigate to={`/${lang}${links.mcp(apiHost)}`} replace />;
}

/** Old `/skills/:apiHost` links: the slug is derived from the host. */
function LegacySkillRedirect() {
  const { lang = 'en', apiHost = '' } = useParams();
  return <Navigate to={`/${lang}${links.skill(skillSlugFor(apiHost))}`} replace />;
}

/** Unknown path under a valid language: redirect to that language's 404 page. */
function NotFoundRedirect() {
  const { lang } = useParams();
  return <Navigate to={`/${lang ?? 'en'}/404`} replace />;
}

/**
 * Top bar + footer around every page. The inner ErrorBoundary and Suspense
 * keep the shell visible while a page chunk loads or fails. `SignInProvider`
 * mounts the one in-flow sign-in modal (see its file for the rule).
 */
function ScreenContainerLayout() {
  return (
    <SignInProvider>
      <ScreenContainer>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </ScreenContainer>
    </SignInProvider>
  );
}

/**
 * `/` and paths with an unsupported first segment go to LanguageRedirect;
 * LanguageValidator checks `:lang` and remembers it under the `language`
 * storage key (the same key i18n.ts reads).
 */
function AppRoutes() {
  return (
    <DocumentLanguageSync>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={<LanguageRedirect isLanguageSupported={isLanguageSupported} />}
            />
            <Route
              path="/:lang"
              element={
                <LanguageValidator
                  isLanguageSupported={isLanguageSupported}
                  defaultLanguage="en"
                  storageKey="language"
                />
              }
            >
              <Route element={<ScreenContainerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="domains" element={<DomainsPage />} />
                <Route path="api" element={<ApiPage />} />
                <Route path="endpoint" element={<EndpointPage />} />
                <Route path="mcps" element={<McpsRoute />} />
                <Route path="mcps/:apiHost" element={<LegacyMcpRedirect />} />
                <Route path="skills" element={<SkillsRoute />} />
                <Route path="skills/:apiHost" element={<LegacySkillRedirect />} />
                <Route path="sites" element={<SiteListPage />} />
                <Route path="sites/:origin" element={<SiteDetailPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <EntityRedirect />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard/:entitySlug"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="api-keys" replace />} />
                  <Route path="api-keys" element={<ApiKeysPage />} />
                  <Route path="workspaces" element={<WorkspacesPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="invitations" element={<InvitationsPage />} />
                </Route>
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundRedirect />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={<LanguageRedirect isLanguageSupported={isLanguageSupported} />}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </DocumentLanguageSync>
  );
}

/** Root component, rendered by main.tsx once initializeApp() has resolved. */
export default function App() {
  return (
    <SudobilityAppWithFirebaseAuthAndEntities
      i18n={i18n}
      apiUrl={CONSTANTS.API_URL}
      AuthProviderWrapper={AuthProviderWrapper}
      EntityAwareSubscriptionProvider={false}
      LoadingFallback={Loading}
      storageKeyPrefix="raidr"
    >
      <SEOHeadProvider config={seoHeadConfig}>
        <SEOHead title={seoHeadConfig.appName} description={seoHeadConfig.appName} />
        <AppRoutes />
      </SEOHeadProvider>
    </SudobilityAppWithFirebaseAuthAndEntities>
  );
}
