# CLAUDE.md — raidr_app

> **Git policy — never auto-commit or auto-push.** Leave work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `push_all.sh` **only when the
> user explicitly asks in that turn.** Finishing a task is not permission to commit it.

Public catalog UI + account dashboard for raidr: browse published MCP servers,
agent skills, websites and their API domains, with an API playground (endpoint
docs, a flow map, and "try it" requests proxied through raidr_api) and a
signed-in dashboard for organizations and their `raidr_…` API keys.

React 19 + Vite + TypeScript + Tailwind, built on `@sudobility/*` packages,
deployed to Cloudflare Pages. **Bun only.** No CI workflow by design
(`.github/` is just `dependabot.yml`); the site ships only via `bun run deploy`.

Layer position: `raidr_types → raidr_client → raidr_lib → raidr_app` (this repo).
`package.json` is `"private": true`; nothing here is published to npm.

## Commands

| Command | What | Notes |
| --- | --- | --- |
| `bun run dev` | Vite dev server | http://localhost:5144 |
| `bun run verify` | typecheck → lint → test:unit → build | the gate; exit 0 |
| `bun run typecheck` | `tsc -b` (app + node configs, incl. tests) | |
| `bun run lint` | `eslint .` (ignores `dist`) | |
| `bun run test:unit` | Vitest once, happy-dom, `src/test/setup.ts` | 3 files / 5 tests |
| `bun run build` | `tsc -b && vite build` → `dist/` | |
| `bun run format[:check]` | Prettier over `src/**` | **not** in `verify`; run it yourself |
| `bun run generate` | SEO assets + Playwright prerender | deploy-time only, not for dev |
| `bun run deploy` | `wrangler pages deploy dist --project-name raidr-app` | production — do not run unasked |

`@sudobility/*` deps come from **GitHub Packages** (`.npmrc` points `@sudobility`
at `https://npm.pkg.github.com`); `bun install` needs a read token in your global
`~/.npmrc` or it 401s. Last verified green: `bun run verify` and tests on 2026-11-08.

## Architecture

- **Entry** `src/main.tsx`: `setFirebaseProxy(VITE_FIREBASE_PROXY)`, then
  `initializeApp()` (`src/config/initialize.ts`: inject the `defaultTheme` CSS as
  `<style id="sudobility-design-theme">`, then di_web `initializeWebApp` — storage,
  Firebase app + Analytics, network, `initializeI18n`, service worker), then a
  dynamic `import('./App')`. Services must exist before any component renders.
- **Shell** `src/App.tsx`: `SudobilityAppWithFirebaseAuthAndEntities` from
  `@sudobility/entity_pages` supplies i18n, theme, TanStack Query, toasts, router,
  the Analytics page tracker, Firebase Auth, the API context and
  `CurrentEntityProvider`. Props: `apiUrl={CONSTANTS.API_URL}`,
  `AuthProviderWrapper={AuthProvider}`, `storageKeyPrefix="raidr"`. No subscription
  provider yet (pricing later). All routes live under `/:lang`.
- **Auth** `src/context/AuthContext.tsx` wraps `@sudobility/auth_lib/auth-js`
  (`createFirebaseAuthContext` + `useFirebaseAuthJs`); exports `AuthProvider`,
  `useAuth`, `useIsLoggedIn`. Google sign-in uses Firebase `signInWithPopup`.
- **Data** comes from `@sudobility/raidr_lib` hooks only; components render.
  Pages get `{ networkClient, baseUrl }` from `useApi()`
  (`@sudobility/building_blocks/firebase`) and pass
  `isAuthenticated: !!user && !user.isAnonymous`. The network client adds the
  signed-in user's Firebase ID token, so the same hooks return the full manifest
  once signed in.
- **Layout**: `ScreenContainer` → building_blocks `AppPageLayout` (base top bar +
  footer); each page wraps content in `Section` (max-w-7xl, padded). `SignInProvider`
  (in `ScreenContainerLayout`) mounts the one in-flow sign-in modal.

### File map (non-obvious bits)

```
src/
├── config/        constants.ts (CONSTANTS from VITE_*), links.ts (links.* + skillSlugFor),
│                  languages.ts (SUPPORTED_LANGUAGES = ['en']), initialize.ts, entityClient.ts
├── hooks/         useSignIn (shared handlers+words for /login page AND modal),
│                  useTopBarConfig, useFooterConfig, useLocalizedNavigate, useDocumentLanguage
├── context/AuthContext.tsx   auth_lib-backed AuthProvider (see above)
├── components/
│   ├── auth/      SignInProvider + signInContext (useSignInModal), AuthAction
│   ├── layout/    ScreenContainer, Section, ErrorBoundary, LocalizedLink (local wrapper!),
│   │              ProtectedRoute (prompt+modal in place, no redirect), EntityRedirect
│   ├── api/       MethodBadge, AuthBadge, ParamField, CredentialPanel, TokenGuide,
│   │              ResponseView, SchemaTree, FlowMap + FlowGroupNode (@xyflow/react)
│   ├── SignInPrompt, ConnectDocs, ToolsTable, CopyBlock, Markdown, SearchPagination, PageState
├── pages/         one lazy default export per route (+ dashboard/ via entity_pages)
├── seoHead.ts     SEOHeadConfig for @sudobility/seo_lib
public/locales/en/{app,auth}.json   ALL UI text (app = pages, auth = sign-in)
public/_redirects   `/ /en 308`, SPA fallback `/* /index.html 200`
functions/_middleware.js   Cloudflare Pages edge SEO injection via seo_lib/middleware
scripts/push_all.sh  raidr-family release driver — never run unasked
```

## Routes (`App.tsx`, all pages lazy, under `/:lang`)

`/` home · `/domains` websites→API domains · `/api?domain={apiHost}` API page ·
`/endpoint?endpoint={ref}` playground (`ref` = encoded `METHOD https://host/path`) ·
`/mcps` + `/mcps?domain=` detail · `/skills` + `/skills?skill={slug}` detail ·
`/sites` + `/sites/:origin` · `/login` · `/dashboard/:entitySlug/{api-keys,workspaces,members,invitations}` ·
`/404`. Legacy `/mcps/:apiHost` & `/skills/:apiHost` redirect to the query forms.

## Conventions

- **Build internal URLs with `links.*` from `src/config/links.ts`** — never hand-write
  `/api?…`, `/endpoint?…`, `/mcps?…`, `/skills?…`. Route params are `encodeURIComponent`-ed.
- **Sign-in: a page when you go there, a modal when you're mid-task.** Top bar's Log in →
  `/:lang/login` (building_blocks `LoginPage`). Sign-in needed mid-flow (signed-out MCP/API/
  endpoint page, dashboard, any account action) opens components' `LoginModal` over the current
  page via `useSignInModal().openSignIn(onSuccess?)`. **Never** `navigate('/login')`,
  `<Navigate to=login>`, or a `?redirect=` round-trip from those places — `ProtectedRoute`
  renders the prompt at the same URL and opens the modal on arrival. Both surfaces draw
  handlers+words from `useSignIn`.
- **Signed-out views use summary data only** (`useMcp().summary`); the full manifest is fetched
  only when `isAuthenticated`, and the API enforces this with a 401.
- All UI prose lives in `public/locales/en/{app,auth}.json`, with the same default in each
  `t('key', 'default')` call. Keep keys and usages in sync.
- Page/list render order: `isLoading → <Loading/>`, `error → <ErrorState/>`, `notFound/empty →
  <EmptyState/>`. `notFound` vs `error` comes from raidr_lib `detailState` (404 = not-found,
  else error). `Pagination` always renders, hides itself when `totalCount === 0`.
- The skill page shows exactly one install command (`install.command`).

## Gotchas

- **`vite.config.ts` dedupes** React, TanStack Query, the `@sudobility` UI packages, Firebase and
  both raidr packages; two copies of raidr_lib = two catalog filter stores. It also excludes them
  from `optimizeDeps` and un-ignores `node_modules/@sudobility/**` in the dev watcher, so you can
  swap a local `dist` into `node_modules/@sudobility/<pkg>/dist` to try an unpublished build (next
  `bun install` restores npm; ship only against published versions).
- `tailwind.config.js` `content` must include the `@sudobility` UI packages, or their classes get
  purged. `src/` doesn't import subscription/devops components, but they match optional
  building_blocks peers — check the build before removing.
- **Keep the local `src/components/layout/LocalizedLink.tsx` wrapper** — it adds the `/:lang` prefix;
  the shared `@sudobility/components` one does a `to.startsWith('/en')` string check that drops the
  language from `/endpoint?…`.
- Firebase config (`VITE_FIREBASE_*`) is required; without it Auth/Analytics and the data hooks
  can't init. `VITE_API_URL` defaults to `https://api.raidr.app` (trailing `/` stripped); local
  raidr_api: `VITE_API_URL=http://localhost:8037` on the same Firebase project.
- Auth hooks (`useAuth`, building_blocks `useApi`) throw outside the provider tree — don't call them
  from anything rendered by a pre-auth config notice.
- `ErrorBoundary` is a class; it calls `i18n.t` directly (no hooks).
- **FlowMap** (`components/api/`) draws raidr_lib's dagre-laid-out graph as-is. Custom node types are
  `tile` and `endpointGroup` — **never name a type `group`** (React Flow reserves it) and don't revert
  to default nodes (their stylesheet pins 150px). Tile colors: this API = card color, other-domain
  endpoints = amber, log-in step = emerald, groups = sky. `+N more` toggles `ApiPage.expandedGroups`
  (re-runs layout). Minimap only above 1100px, hidden on phones.
- Playground sign-in: with the [raidr extension](https://github.com/johnqh/raidr_extension) the site's
  token is captured automatically; without it the popup is cross-origin and the user copies the token
  by hand (`TokenGuide`). New deploy domains must be added to the extension's `BRIDGE_MATCHES`.
  Credentials (site token + app key) stay in `localStorage` per API host (unless Remember is off) and
  leave the browser only inside the execute request.
