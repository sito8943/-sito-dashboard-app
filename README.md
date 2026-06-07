# @sito/dashboard-app

`@sito/dashboard-app` is a React 18 component and utilities library for building Sito-style admin dashboards, CRUD screens, and internal tools. It packages UI components, hooks, providers, typed API helpers, and styles in a single npm package.

## Documentation scope and source of truth

| Document                             | Primary audience              | Source of truth for                                       |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------- |
| `README.md` (this file)              | Consumer apps and maintainers | Install, requirements, scripts, doc index                 |
| `AGENTS.md`                          | AI agents and maintainers     | Implementation rules and reference tables                 |
| `docs/CONSUMER_GUIDE.md`             | Consumer apps                 | Providers, components, props, hooks, API clients          |
| `docs/RECIPES.md` (+ split files)    | Consumer apps                 | Index of themed recipe files (layout/data/forms)          |
| `docs/RECIPES_LAYOUT.md`             | Consumer apps                 | Providers, app/auth shells, fallback views, PWA, drawer   |
| `docs/RECIPES_DATA.md`               | Consumer apps                 | CRUD, entity clients, exports                             |
| `docs/RECIPES_FORMS.md`              | Consumer apps                 | Forms, dialogs, tabs/onboarding, feedback, auth, errors   |
| `docs/THEME_AND_CSS.md`              | Consumer apps                 | CSS tokens, theme variables, safe overrides               |
| `docs/TROUBLESHOOTING.md`            | Consumer apps                 | Common provider/typing/styling/auth/routing issues        |
| `docs/ARCHITECTURE_RULES.md`         | Maintainers                   | Internal layering and folder rules                        |
| `docs/TRANSLATIONS_DASHBOARD_APP.md` | Consumer apps                 | i18n keys required by the library                         |
| `.sito/*.md`                         | Internal team and agents      | Upstream `@sito/dashboard` reference (not canonical here) |

Important:

- `@sito/dashboard-app` is **not SSR-compatible**. Browser-only.
- For auth-enabled apps, use `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when needed; `BottomNavActionProvider` optional for dynamic mobile center actions).
- `Drawer` and `Onboarding` run without `AuthProvider`; guest entry is owned by `Onboarding`.
- `IconButton` differs by package:
  - `@sito/dashboard`: `icon` accepts a React node.
  - `@sito/dashboard-app`: `icon?: IconDefinition` (FontAwesome wrapper export).

## Installation

```bash
npm install @sito/dashboard-app
# or
yarn add @sito/dashboard-app
# or
pnpm add @sito/dashboard-app
```

Peer dependencies:

```bash
npm install \
  react@18.3.1 react-dom@18.3.1 \
  @sito/dashboard@^0.0.84 \
  @tanstack/react-query@5.83.0 \
  react-hook-form@7.61.1 \
  @fortawesome/fontawesome-svg-core@7.0.0 \
  @fortawesome/free-solid-svg-icons@7.0.0 \
  @fortawesome/free-regular-svg-icons@7.0.0 \
  @fortawesome/free-brands-svg-icons@7.0.0 \
  @fortawesome/react-fontawesome@0.2.3
```

Supabase backend (optional):

```bash
npm install @supabase/supabase-js@2.100.0
```

## Requirements

- Node.js `20.x` (see `.nvmrc`)
- Browser runtime only (no SSR)
- React `18.3.1`
- React DOM `18.3.1`
- `@tanstack/react-query` `5.83.0`
- `@supabase/supabase-js` `2.100.0` (optional)
- `react-hook-form` `7.61.1`
- `@sito/dashboard` `^0.0.84`
- Font Awesome peers per `package.json`

## Quick start

1. Wrap your app with providers in canonical order (or use `AppProviders` / `createAppProviders`).
2. Extend `BaseClient` (or `SupabaseDataClient`) per API resource.
3. Compose pages with `AppShell` + `DashboardHeader` + `DashboardFooter` + `Page` + dialog/form hooks.

Detailed setup, examples, and prop tables live in:

- [Consumer Guide](./docs/CONSUMER_GUIDE.md) — installation, providers, components, props, hooks, API clients.
- [Recipes index](./docs/RECIPES.md) — themed copy-ready snippets: [layout/providers](./docs/RECIPES_LAYOUT.md), [data/CRUD/exports](./docs/RECIPES_DATA.md), [forms/dialogs/UX](./docs/RECIPES_FORMS.md).
- [Theme and CSS](./docs/THEME_AND_CSS.md) — design tokens and safe CSS overrides.
- [Troubleshooting](./docs/TROUBLESHOOTING.md) — provider/typing/styling/auth/routing diagnostics.
- [Translations Reference](./docs/TRANSLATIONS_DASHBOARD_APP.md) — required i18n namespaces and keys.

## Core exports

- Layout and navigation: `Page`, `Navbar`, `Drawer`, `BottomNavigation`, `TabsLayout`, `PrettyGrid`, `ToTop`
- Layout shells: `AppShell`, `AuthShell`, `DashboardHeader`, `DashboardFooter`
- Reusable views: `NotFoundView`, `FeatureUnavailableView`
- Actions and menus: `Actions`, `Action`, `Dropdown`, button components
- Dialogs and forms: `Dialog`, `FormDialog`, `ImportDialog`, `ExportDialog`, `PwaUpdateDialog`, form inputs
- Feedback: `Notification`, `Loading`, `Empty`, `Error`, `Onboarding`, `OfflineBanner`, `TopBanner`
- Hooks: `useFormDialog`, `usePostDialog`, `usePutDialog`, `useImportDialog`, `useExportDialog`, `useDeleteDialog`, `useMutationForm`, `useDeleteAction`, `useNavbar`, `useOnlineStatus`, `useOnlineStatusSnapshot`, and more — action hooks ship with default `sticky`, `multiple`, `id`, `icon`, `tooltip`; only `onClick` is required.
- Providers and utilities: `ConfigProvider`, `ManagerProvider`, `AppProviders`, `createAppProviders`, `SupabaseManagerProvider`, `AuthProvider`, `SupabaseAuthProvider`, `NotificationProvider`, `DrawerMenuProvider`, `NavbarProvider`, `BottomNavActionProvider`, `useBottomNavAction`, `useOptionalBottomNavAction`, `useRegisterBottomNavAction`, DTOs, API clients (`BaseClient`, `SupabaseDataClient`), `useSupabase`, `filterMenuByFeatureFlags`, `normalizeMenuDividers`.

## Local development

```bash
git clone https://github.com/sito8943/-sito-dashboard-app.git
cd ./-sito-dashboard-app
nvm use
npm install
npm run dev
# optional: npm run storybook
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — TypeScript + library build
- `npm run preview` — preview built bundle locally
- `npm run lint` — ESLint + Prettier check + depcheck (no writes)
- `npm run lint:fix` — ESLint autofix + Prettier write
- `npm run docs:check` — docs policy markers, relative links, version alignment
- `npm run test` — Vitest single run
- `npm run test:watch` — Vitest watch mode
- `npm run format` — Prettier write
- `npm run storybook` — run Storybook locally
- `npm run build-storybook` — static Storybook build

## Validation stack

- `npm run lint`
- `npm run docs:check`
- `npm run test`
- `npm run build`
- Storybook / manual visual checks (optional)

## Deployment / release

CI:

- `.github/workflows/ci.yml` — `test + build` on push / PR
- `.github/workflows/lint.yml` — `lint + docs:check` on PR

Manual release:

```bash
npm version patch        # or minor / major
npm run lint
npm run test
npm run build
npm publish --access public
git push --follow-tags
```

## Contributing

1. Fork the repo.
2. Branch per feature/fix.
3. Open a PR with change summary + validation notes.

## License

MIT (see `LICENSE`).
