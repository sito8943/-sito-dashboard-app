# AGENTS.md — @sito/dashboard-app

Agent guardrails for projects consuming **`@sito/dashboard-app`** (React 19 UI library on top of `@sito/dashboard`).
Public usage examples live in `docs/CONSUMER_GUIDE.md` and the themed recipe files (`docs/RECIPES.md` is the index; recipes are split into `docs/RECIPES_LAYOUT.md`, `docs/RECIPES_DATA.md`, `docs/RECIPES_FORMS.md`). `README.md` is the entry point (install + doc index). This file is canonical for agent behavior; do not duplicate setup snippets here.

---

## Documentation Scope

| Document                                                                                                | Authority                                                       |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `README.md`                                                                                             | Entry point — install, requirements, scripts, doc index         |
| `docs/CONSUMER_GUIDE.md`                                                                                | Canonical for `@sito/dashboard-app` consumer usage and examples |
| `docs/RECIPES.md` (index) + `docs/RECIPES_LAYOUT.md` / `docs/RECIPES_DATA.md` / `docs/RECIPES_FORMS.md` | Canonical for copy-ready integration recipes (split by theme)   |
| `AGENTS.md`                                                                                             | Canonical for agent behavior in this repo                       |
| `.sito/*.md`                                                                                            | Reference only (upstream `@sito/dashboard`)                     |

Critical distinctions (override anything in `.sito/*`):

- Provider order: `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when `Navbar`/`useNavbar` used). Manual or via `AppProviders` / `createAppProviders`.
- Browser-only. **Not SSR-compatible.**
- `IconButton` is overridden — expects `icon: IconDefinition` (FontAwesome), not a React node.

---

## Tech Stack

| Layer        | Technology           | Version |
| ------------ | -------------------- | ------- |
| UI Framework | React                | 19.2.7  |
| Language     | TypeScript           | 7.0.2   |
| Runtime      | Node.js              | 22.x    |
| Styling      | Tailwind CSS         | 4.x     |
| Icons        | FontAwesome          | 7.0.0   |
| Forms        | React Hook Form      | 7.61.1  |
| Server State | TanStack React Query | 5.x     |
| Base Library | @sito/dashboard      | 0.3.0   |

Peer install (consumer project):

```bash
npm install \
  react@19.2.7 react-dom@19.2.7 \
  @sito/dashboard@0.3.0 \
  @tanstack/react-query@5.83.0 \
  react-hook-form@7.61.1 \
  @fortawesome/fontawesome-svg-core@7.0.0 \
  @fortawesome/free-solid-svg-icons@7.0.0 \
  @fortawesome/free-regular-svg-icons@7.0.0 \
  @fortawesome/react-fontawesome@3.4.0
```

See `docs/CONSUMER_GUIDE.md` for: full provider setup, `AppProviders` composer, Supabase backend, component prop tables, hook signatures, `BaseClient` / `SupabaseDataClient` extension, dialog/form/auth/notification examples, styling config. See the themed recipe files for copy-ready snippets — `docs/RECIPES_LAYOUT.md` (providers, shells, fallback views, drawer), `docs/RECIPES_DATA.md` (CRUD, clients, exports), `docs/RECIPES_FORMS.md` (forms, dialogs, tabs/onboarding, feedback, auth, errors). `docs/RECIPES.md` indexes them.

---

## Reference Tables

### Provider responsibilities

| Provider               | Purpose                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ConfigProvider`       | Router `location`, `navigate`, `linkComponent`, optional `searchComponent`, global `motion` (`auto`/`none`/`always`)        |
| `ManagerProvider`      | API manager (`IManager`); mounts `QueryClientProvider` internally                                                           |
| `AuthProvider`         | Session (`token`, `refreshToken`, `accessTokenExpiresAt`, `remember`); exposes `account`, `logUser`, `logoutUser`, etc.     |
| `NotificationProvider` | Toast system                                                                                                                |
| `DrawerMenuProvider`   | Drawer menu state                                                                                                           |
| `NavbarProvider`       | Optional dynamic navbar (`title`, `setTitle`, `rightContent`, `setRightContent`) — required when using `Navbar`/`useNavbar` |

### Action hook defaults

| Hook               | `sticky` | `multiple` | `id`        | `icon`             |
| ------------------ | -------- | ---------- | ----------- | ------------------ |
| `useDeleteAction`  | `true`   | `true`     | `"delete"`  | `faTrash`          |
| `useEditAction`    | `true`   | —          | `"edit"`    | `faPencil`         |
| `useRestoreAction` | `true`   | `false`    | `"restore"` | `faRotateLeft`     |
| `useExportAction`  | —        | —          | `"export"`  | `faCloudArrowDown` |
| `useImportAction`  | —        | —          | `"import"`  | `faCloudUpload`    |

All: `hidden = false`, `disabled = false`, tooltip auto-translated. Only `onClick` is required in common cases.

### `BaseClient` methods

| Method       | Signature                                                 |
| ------------ | --------------------------------------------------------- |
| `get`        | `(query?, filters?) => Promise<QueryResult<TDto>>`        |
| `getById`    | `(id: number) => Promise<TDto>`                           |
| `insert`     | `(value: TAddDto) => Promise<TDto>`                       |
| `insertMany` | `(data: TAddDto[]) => Promise<TDto>`                      |
| `update`     | `(value: TUpdateDto) => Promise<TDto>`                    |
| `softDelete` | `(ids: number[]) => Promise<number>`                      |
| `restore`    | `(ids: number[]) => Promise<number>`                      |
| `export`     | `(filters?) => Promise<TDto[]>`                           |
| `import`     | `(data: ImportDto<TImportPreviewDto>) => Promise<number>` |

Auth refresh/retry is centralized in `APIClient`/`BaseClient`: pre-flight refresh on near-expiry, single retry on `401`, in-flight mutex, clears local keys on failure. Do not reimplement in consumer apps.

### Dialog hook choice

- `useFormDialog` — local/state-only (filters, settings); supports `openDialog({ values })` hydration + core `onError({ phase, values })`.
- `usePostDialog` — create flow.
- `usePutDialog` — edit flow (requires `getFunction` + `dtoToForm` + `formToDto(form, dto)`).
- `useDeleteDialog`, `useRestoreDialog`, `useImportDialog`, `useExportDialog` — purpose-specific.

Legacy entity-coupled `useFormDialog` (`mutationFn`, `queryKey`, `getFunction`, `dtoToForm`, `formToDto`) and aliases (`useFormDialogLegacy`, `useEntityFormDialog`) were removed in v0.0.54.

### Export flows

- Direct (no dialog): `useExportAction` + `useExportActionMutate`.
- Config dialog: `useExportDialog` + `ExportDialog` (`defaultExtra` + `renderExtraFields`).
- Same `action()` shape — `Page`/`Actions`/`PrettyGrid` consume either.
- `useExportDialog` does not invalidate queries, does not auto-trigger downloads. Handle in `onSuccess` or inside `mutationFn`.

### Import extension points

- Component `extraFields` slot — consumer-owned state, no payload coupling.
- Hook `defaultExtra` + `renderExtraFields` — payload merged as `{ items, override, ...extra }`; type `mutationFn` as `ImportDto<TPreview> & TExtra`. Prefer this when inputs are part of the import payload.
- `renderCustomPreview(items)` — replaces default JSON preview.

### Error type guards

```ts
import { isValidationError, isHttpError } from "@sito/dashboard-app";
```

### Phase 1 shared shells (consumer apps)

Migrated from `wallet` / `period-calendar` consumer apps; use these instead of forking local copies.

| Export                   | Folder                               | Purpose                                                                                                                                                                            |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`               | `src/layouts/AppShell`               | Authenticated route shell. Slots: `header`, `children`, `footer`, `bottomNavigation`, `extras`. Built-in `Notification` portal (opt out via `withNotification={false}`).           |
| `AuthShell`              | `src/layouts/AuthShell`              | Auth route wrapper. Renders `children` + optional `Notification`. Redirect/error-boundary logic stays in the consumer.                                                             |
| `DashboardHeader`        | `src/layouts/DashboardHeader`        | `Drawer` + `Navbar` combo. Owns drawer state internally. Generic over `MenuKeys`. Optional `OfflineBanner`.                                                                        |
| `DashboardFooter`        | `src/layouts/DashboardFooter`        | Copyright line + optional `ToTop`. `bottomNavSpacing` for apps mounting `BottomNavigation`. Accepts `children` for full custom content.                                            |
| `NotFoundView`           | `src/views/NotFoundView`             | Generic 404 fallback. CTA via `linkComponent` from `ConfigProvider` — consumer supplies `ctaTo` from its own `routes.ts`.                                                          |
| `FeatureUnavailableView` | `src/views/FeatureUnavailableView`   | Generic feature-disabled fallback. Icon defaults to `faWarning`; overridable.                                                                                                      |
| `PwaUpdateDialog`        | `src/components/app/PwaUpdateDialog` | Presentational PWA update prompt. Library does NOT import `navigator.serviceWorker` or `virtual:pwa-register/react` — consumer wires its own SW hook and passes `open`/`onUpdate`. |

### Phase 2 shared auth surface (consumer apps)

Migrated from `wallet` (REST) and `period-calendar` (Supabase) consumer apps; use these instead of forking local clients/utils.

| Export                      | Folder                              | Purpose                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SupabaseAuthClient`        | `src/lib/api/SupabaseAuthClient.ts` | Supabase Auth adapter mirroring `AuthClient` REST contract (`login`/`refresh`/`register`/`getSession`/`logout`) plus `signUp` returning `SupabaseSignUpResult` (`authenticated` \| `confirmation_required`). Options: `sessionMapper`, `mapperOptions`, `defaultSignUpRedirectTo`.                                                                                                                  |
| `IAuthApiClient`            | `src/lib/api/IAuthApiClient.ts`     | Interface for the side-channel auth endpoints (`forgotPassword`, `resetPassword`, `resendConfirmEmail`, `confirmEmail`).                                                                                                                                                                                                                                                                            |
| `RestAuthApiClient`         | `src/lib/api/`                      | REST adapter. Accepts an `APIClient` instance (preferred) or a `baseUrl`. Endpoint paths and optional `confirmEmailFallback` (404-only retry) are configurable.                                                                                                                                                                                                                                     |
| `SupabaseAuthApiClient`     | `src/lib/api/`                      | Supabase adapter. Maps DTOs onto `auth.resetPasswordForEmail` / `auth.resend` / `auth.verifyOtp` / `auth.setSession` + `auth.updateUser` for the access-token reset.                                                                                                                                                                                                                                |
| Auth helpers                | `src/lib/auth/utils.ts`             | `buildAuthRedirectUrl`, `extractAuthQueryParamFromLocation`, `extractRecoveryAccessTokenFromLocation`, `extractAuthSessionTokensFromLocation`, `hasAuthErrorParamsInLocation`, `getAuthErrorMessage`. Read both query string and hash.                                                                                                                                                              |
| `AuthRouteQueryParam(Type)` | `src/lib/auth/types.ts`             | Canonical query/hash param keys (`access_token`, `accessToken`, `refresh_token`, `token`, `token_hash`, `type`, `error`, `error_description`) + type values (`email`, `recovery`, `signup`).                                                                                                                                                                                                        |
| Form types                  | `src/lib/auth/forms.ts`             | `SignInFormType<TExtra>`, `SignUpFormType<TExtra>`, `UpdatePasswordFormType`, `RecoveryFormType`.                                                                                                                                                                                                                                                                                                   |
| DTOs                        | `src/lib/entities/auth/`            | `ForgotPasswordDto`, `ResetPasswordDto` (union: access-token + optional refresh-token, or token-hash + type), `ResendConfirmEmailDto`, `ConfirmEmailDto`, `AcceptedResponseDto`.                                                                                                                                                                                                                    |
| `useAuthSessionState`       | `src/providers/Auth/`               | Shared session-state hook composed by `AuthProvider` (REST) and `SupabaseAuthProvider`. Centralizes storage-key resolution, `account` state, `clearStoredSession`, `isInGuestMode` / `setGuestMode`, and `logUser`. Returns `{ account, setAccount, storageKeys, clearStoredSession, isInGuestMode, setGuestMode, logUser }`. Reuse when building a custom auth provider on the same `AuthContext`. |

### Phase 3 shared legal/info primitives (consumer apps)

Migrated from `wallet` / `period-calendar` `views/Info/*`. Composable, i18n-agnostic — consumer resolves `<Trans>` / `t()` and passes ReactNode in.

| Export               | Folder                 | Purpose                                                                                                                                                                                                 |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LegalPage`          | `src/views/LegalPage/` | Page shell. Slots: `title`, optional `intro`, `children`. No `sections` prop — compose with `LegalSection` for flexibility.                                                                             |
| `LegalSection`       | `src/views/LegalPage/` | Titled rounded-card primitive (`<article>` + `h3` + body slot). Use inside `LegalPage` for policy sections, "Legal links" blocks, or anywhere a titled card is needed.                                  |
| `LegalLinksList`     | `src/views/LegalPage/` | Bulleted list of `{to, label}` links. Routes through `linkComponent` from `ConfigProvider`. Returns `null` when `links` is empty.                                                                       |
| `richTextComponents` | `src/views/LegalPage/` | Styled ReactNode map (`p`, `strong`, `em`, `ul`, `ol`, `li`, `a`, `code`) for `react-i18next` `<Trans components={...}>`. Library has zero `react-i18next` coupling — this is just a default style map. |

### Onboarding step animations

- Lib ships `onboarding-step-rise-in` + `onboarding-step-pop-in` keyframes with stagger (title 30ms / body 90ms / content 140ms / actions 180–230ms) in `src/components/app/Onboarding/styles.css`.
- Default reconciliation reuses the `<Step>` tree across step changes — animations only play on first mount.
- Opt into per-step remount via `<Onboarding remountStepOnChange />`.
- Gated by `ConfigProvider.motion`: disabled on `:root[data-sito-motion="none"]` and under `prefers-reduced-motion: reduce` unless `motion="always"`.

### Onboarding action buttons

- Non-first steps get a Back button automatically (decrements step). `Step` exposes `onClickBack?` for custom wiring.
- Each action button renders a FontAwesome icon + label. Defaults: `back=faArrowLeft`, `next=faArrowRight`, `skip=faForward`, `startAsGuest=faUserSecret`, `signIn=faRightToBracket`.
- Override per-action via `<Onboarding icons={{ back, next, skip, startAsGuest, signIn }} />`. Same prop available on `Step`.
- Default responsive: icon-only below `28rem` (auto width), label-only at/above (min-width 10rem).
- Three display flags — `alwaysShowIcon`, `alwaysHideLabel`, `showLabelOnMobile` — accept `boolean` (applies to every action) or a per-action map (`{ back?, next?, skip?, startAsGuest?, signIn? }`). Use the map form for granular layouts, e.g. `showLabelOnMobile={{ startAsGuest: true }}` keeps next/back icon-only on mobile while letting the central guest CTA show its label. `alwaysHideLabel` wins over the other two when both apply to the same action.
- All four onboarding-level controls (`icons` + the three flags) can also be set per-step on each `steps[]` entry. Per-step values are merged on top of onboarding-level values per-action — step keys win for what they define, missing keys inherit from the onboarding-level value (boolean inheritance expands a boolean base into a per-key default).

---

## Agent Rules

1. **Install all peer deps.** Missing peers fail silently at runtime.
2. **Wrap with all required providers in order** (see Critical distinctions).
3. **Import only from `"@sito/dashboard-app"`.** Never from internal paths.
4. **Always supply generic type parameters** for components/hooks when entity types exist.
5. **Extend base DTOs** (`BaseEntityDto`, `BaseFilterDto`, `BaseCommonEntityDto`, `DeleteDto`, `ImportPreviewDto`).
6. **Extend `BaseClient`** per API resource. No raw fetch.
7. **Use `isValidationError` / `isHttpError`** for error branching.
8. **Use provided hooks** (`useDeleteAction`, `useMutationForm`, dialog hooks) instead of reimplementing.
9. **Use `useNotification`** for user feedback. No `alert` / console-only.
10. **Use `State` + `*StateClassName` utilities** for stateful inputs. No inline style overrides.
11. **No `any`.** Library is fully typed — find the right DTO/utility.
12. **`IconButton` expects `icon: IconDefinition`** (not React node) — diverges from upstream `@sito/dashboard`.
13. **Send `rememberMe` from sign-in** when the UI exposes a remember option.
14. **No ad-hoc token refresh.** Rely on centralized `APIClient`/`BaseClient` refresh/retry.
15. **Align auth storage keys** between `AuthProvider` and `IManager`/`BaseClient` auth config (`rememberKey`, `refreshTokenKey`, `accessTokenExpiresAtKey`).
16. **`Error` is single-mode.** Default props (`error`/`message`/`icon`/`onRetry`) OR `children` — never both.
17. **`TabsLayout` link mode intentional.** Links for routes; `useLinks={false}` + `tabButtonProps` for local state.
18. **`TabsLayout` controlled (`currentTab` + `onTabChange`)** when parent owns step state (onboarding, wizards). `defaultTab` only for uncontrolled initial selection.
19. **`Onboarding` steps are structured** (`title`, `body`, optional `content`/`image`/`alt`). No `_pages:onboarding.*` keys. Resolve i18n consumer-side.
20. **Use `ImportDialog` extension points** (`renderCustomPreview`, hook `defaultExtra`/`renderExtraFields`, component `extraFields`). No forks.
21. **Use `PrettyGrid` infinite scroll props** (`hasMore`, `loadingMore`, `onLoadMore`, `loadMoreComponent`, observer options). No grid forks.
22. **Use `ToTop` customization props** (`threshold`, target coords, `tooltip`, `icon`, `scrollOnClick`, `onClick`). No ad-hoc wrappers.
23. **Keep Node version aligned with `.nvmrc`** in setup docs.
24. **Run `pnpm run docs:check`** after doc edits.
25. **Never document or propose SSR** for this package.
26. **Pick the right export flow** — direct (`useExportAction`) vs config dialog (`useExportDialog`). Both return the same `action()` shape. `useExportDialog` doesn't invalidate queries or auto-download.
27. **Place new components by tier** under `src/components/`:
    - `ui/` — generic primitives. No provider/domain coupling. May only depend on other `ui/` siblings.
    - `app/` — high-level/shell pieces coupled to providers, routing, or domain (e.g. `Navbar`, `Drawer`, `Notification`, `BottomNavigation`, `Page`, `Onboarding`, `OfflineBanner`, `PwaUpdateDialog`).
    - `app/` may import from `ui/`. `ui/` must NOT import from `app/`. Public surface stays the same — re-export through `src/components/index.ts`.
28. **Place page-level screens** under `src/views/` (e.g. `NotFoundView`, `FeatureUnavailableView`) and **shared layout shells** under `src/layouts/` (e.g. `AppShell`, `AuthShell`, `DashboardHeader`, `DashboardFooter`). Each follows the §7 feature folder convention (`FeatureName.tsx` + `types.ts` + `index.ts` + optional `constants.ts`/`utils.ts`).
29. **Use `AppShell` / `AuthShell` instead of bespoke layout wrappers.** Mount providers via `AppProviders`, then compose routes with these shells. `AppShell` slots: `header` / `children` / `footer` / `bottomNavigation` / `extras` (Tooltip/Onboarding/PwaUpdateDialog) — in that render order — plus the built-in `Notification` portal. Opt out with `withNotification={false}` only when mounting your own.
30. **Use `DashboardHeader` / `DashboardFooter` instead of forking app-local header/footer files.** Drawer open/close state lives inside `DashboardHeader`. Set `bottomNavSpacing` on `DashboardFooter` when also mounting `BottomNavigation`.
31. **Use `NotFoundView` / `FeatureUnavailableView` for 404 / feature-off fallbacks.** Pass `ctaTo` from the consumer's `routes.ts` constants — never hardcode. CTA navigation goes through `linkComponent` from `ConfigProvider`, so they stay router-agnostic.
32. **`PwaUpdateDialog` is presentational only.** Library never imports `navigator.serviceWorker` or `virtual:pwa-register/react`. Consumer owns the SW source (`useServiceWorkerUpdate` custom hook, `vite-plugin-pwa`'s `useRegisterSW`, etc.) and passes `open` / `onDismiss` / `onUpdate` plus consumer-side i18n strings.
33. **`Onboarding` step animations are opt-in per-mount.** Default reuses the step tree (no animation restart between steps). Set `remountStepOnChange={true}` for wizard-like flows where each step should animate in from scratch. Library provides the keyframes (`onboarding-step-rise-in`/`onboarding-step-pop-in`); do NOT redeclare them in consumer CSS.
34. **Use `IAuthApiClient` adapters for password reset / email confirmation.** Pick `RestAuthApiClient` (REST APIs) or `SupabaseAuthApiClient` (Supabase) — do not hand-roll the endpoints in consumer apps. `RestAuthApiClient` accepts an existing `APIClient` so storage keys and refresh/retry stay aligned with the rest of the app's data clients. Use `confirmEmailFallback` only as a transitional shim for backends mid-migration.

35. **Use `AuthClient` (REST) or `SupabaseAuthClient` for session endpoints** (login / refresh / register / getSession / logout). Do not subclass them just to swap a session mapper — pass `sessionMapper` (or `mapperOptions`) to `SupabaseAuthClient`'s constructor. When email confirmation is required, call `signUp(data)` and discriminate on `result.status`; `register()` throws on the confirmation-required branch.

36. **Use shipped auth URL/token helpers** (`buildAuthRedirectUrl`, `extractAuthQueryParamFromLocation`, `extractRecoveryAccessTokenFromLocation`, `extractAuthSessionTokensFromLocation`, `hasAuthErrorParamsInLocation`, `getAuthErrorMessage`) instead of re-implementing query/hash parsing per app. They read both search and hash so Supabase recovery flows (hash-fragment tokens) and REST flows (query-string tokens) share one call site.

37. **Compose legal/info pages with `LegalPage` + `LegalSection` + `LegalLinksList`** instead of forking the shell HTML/CSS. `LegalPage` is i18n-agnostic — resolve `<Trans>` / `t()` in the consumer and pass `ReactNode` for `title` / `intro` / section bodies. Use `richTextComponents` as the default component map for `<Trans>` and spread to extend (`{ ...richTextComponents, br: <br /> }`). Sections are children, not a `sections` prop — apps can interleave product-specific blocks (e.g. wallet's `HowToSection`) with shared `LegalSection` cards. `LegalLinksList` routes through `linkComponent` from `ConfigProvider` — pass `{to, label}` items from the consumer's `routes.ts`.
