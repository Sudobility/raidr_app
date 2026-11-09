# raidr_app

Public web app for browsing raidr MCP servers and agent skills, with
connection docs for Claude Code, Claude Desktop and Cursor, and install docs
for each skill. It also documents each API domain: a Swagger-like playground
lists its endpoints with typed parameters, runs requests through raidr_api,
and draws a flow map of which endpoints feed which.

React 19 + Vite + Tailwind on the `@sudobility` building blocks, deployed to
Cloudflare Pages. Firebase Auth with organizational entities: browsing MCPs
and skills needs no login, but the full MCP detail does. Where a page needs
an account, sign-in opens as a modal over that page and you stay where you
were; the `/login` page is only for going there on purpose. Signed-in users
manage organizations, members and `raidr_…` API keys in the dashboard, and use
a key to connect any MCP client to `https://api.raidr.app/mcp/<apiHost>`.

## Routes

| Path | Page |
| --- | --- |
| `/:lang` | home: counts and a how-it-works walkthrough |
| `/:lang/domains` | websites, each expanding to the API domains it uses |
| `/:lang/api?domain={apiHost}` | API page: endpoints grouped by tag and a flow map (signed in), links to its MCP server and skill |
| `/:lang/endpoint?endpoint={ref}` | endpoint playground: docs, parameter inputs, credentials, Execute and the response (signed in); `ref` is the encoded `METHOD https://host/path` |
| `/:lang/mcps`, `/:lang/mcps?domain={apiHost}` | MCP catalog; detail shows the summary signed out, and tools plus connection snippets signed in |
| `/:lang/skills`, `/:lang/skills?skill={slug}` | skill catalog; detail renders SKILL.md with a one-line install command |
| `/:lang/sites`, `/:lang/sites/:origin` | crawled sites and the API hosts they call (origin is URL-encoded) |
| `/:lang/login` | sign-in page, reached from the top bar's Log in (Google or email, sign-up, password reset) |
| `/:lang/mcps/:apiHost`, `/:lang/skills/:apiHost` | old links; redirect to the query forms |
| `/:lang/dashboard/:entitySlug/{api-keys,workspaces,members,invitations}` | account dashboard, signed in only; signed out, it asks for sign-in in place (modal) rather than redirecting |

Credentials entered in the playground (a site token or an application key)
are remembered in this browser per API domain and sent only with the request
you execute; raidr never stores them.

With the [raidr browser extension](https://github.com/johnqh/raidr_extension#install)
installed, "Sign in to {site}" in the playground is automatic: the extension
opens the site, picks up your token once you are signed in, closes the window
and fills the token in. Without it, the playground opens the site in a popup
and shows a step-by-step guide to copying the token by hand.
`VITE_EXTENSION_URL` sets where the "Get the raidr extension" link points.

## Run

```bash
cp .env.example .env      # VITE_API_URL, and VITE_FIREBASE_* (required)
bun install
bun run dev               # http://localhost:5144
```

Bun is the only supported package manager. The `@sudobility/*` dependencies
come from GitHub Packages (`.npmrc` points `@sudobility` at
`https://npm.pkg.github.com`), so `bun install` needs a GitHub Packages read
token in your global `~/.npmrc` (`//npm.pkg.github.com/:_authToken=...`) or it
will 401.

## Test, verify and deploy

```bash
bun run test:unit         # Vitest once (happy-dom)
bun run verify            # typecheck + lint + test:unit + build
bun run build             # tsc -b && vite build → dist/
bun run deploy            # wrangler pages deploy dist --project-name raidr-app
```

`bun run format` / `format:check` run Prettier over `src/**`; `format:check` is
not part of `verify`. `bun run generate` rebuilds the SEO assets and prerenders
routes with Playwright (used at deploy time); it is not needed for local dev.

There is no CI workflow for this app by design (`.github/` holds only
`dependabot.yml`); deploy from a checkout. `functions/_middleware.js` injects
SEO snapshots at the edge on Cloudflare Pages via `@sudobility/seo_lib`.

## Layers

`raidr_types` → `raidr_client` → `raidr_lib` → **raidr_app**
