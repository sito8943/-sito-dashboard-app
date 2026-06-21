# Changelog

All notable changes to this project will be documented in this file.

## [0.0.88] - 2026-06-21

### Changed

- Updated the global `Page` refresh action icon from `faRotateLeft` to `faArrowsRotate`, giving refresh controls the standard rotating-arrows visual.
- Aligned the lockfile with the declared `@sito/dashboard` `^0.0.87` dependency.

## [0.0.87] - 2026-06-15

### Changed

- Bumped the dev dependency `vitest` from `3.2.1` to `3.2.6`, which also refreshes the aligned `@vitest/*`, `vite-node`, and other transitive lockfile entries.
- Updated the base library dependency `@sito/dashboard` from `^0.0.85` to `^0.0.86`.

## [0.0.86] - 2026-06-14

### Added

- `Dialog` now accepts `initialFocus?: "first-input" | "submit"` so consumers can choose whether opening a modal focuses the first enabled field or the submit action.
- `ConfirmationDialog` now defaults `initialFocus` to `"submit"`, making destructive/confirmation flows keyboard-ready without extra consumer wiring.
- Action hooks now accept styling props that are forwarded to the rendered action item: `className`, `iconClassName`, and `labelClassName` on `useDeleteAction`, `useEditAction`, `useRestoreAction`, `useExportAction`, and `useImportAction`.

### Changed

- `Dialog` no longer auto-focuses the first input on open unless `initialFocus="first-input"` is explicitly set. When `initialFocus="submit"`, the first enabled submit control is focused instead.
- `Page` and `PageHeader` now expose `showActionTooltips?: boolean` (default `true`) so desktop inline actions can opt out of tooltip wrappers while mobile dropdown actions keep their visible labels.
- `useExportAction` and `useImportAction` now support overriding their default `id`, `icon`, and `tooltip`, in addition to the new styling props.
- `Empty` no longer forces `showTooltips={false}` on its rendered action buttons, so action tooltip behavior follows the action/component defaults.

### Documentation

- Updated `README.md`, `docs/CONSUMER_GUIDE.md`, `docs/RECIPES_DATA.md`, and `docs/THEME_AND_CSS.md` to document `Dialog.initialFocus`, `ConfirmationDialog` focus behavior, action styling hooks, and `Page`/`PageHeader` tooltip controls.

## [0.0.85] - 2026-05-30

### Added

- `useDialogErrorNotification` — default dialog error handler that surfaces `ValidationError` (per-field stacked notifications) and `HttpError` (status-mapped message) failures as notifications, with a `500` fallback for unknown errors.
- `AutoComplete` now accepts `autoSelectOnBlur` (default `true`). In single-select mode, blur selects the option whose label exactly matches the typed text, ignoring case and surrounding whitespace.

### Changed

- `usePostDialog` and `usePutDialog` now fall back to `useDialogErrorNotification` when no `onError` is provided, so failed mutations are surfaced to the user instead of being swallowed silently. Passing `onError` still overrides the default.
- `useDeleteAction`, `useEditAction`, and `useRestoreAction` are now generic over `<TRow extends BaseEntityDto>`. The id type resolves to `TRow["id"]` and the action factory receives/returns `TRow` / `ActionType<TRow>` instead of being pinned to `BaseEntityDto` with a numeric id.
- `Page` action assembly is now typed against `ActionType<TEntity>` instead of casting through `ActionType<BaseEntityDto>`.

### Documentation

- Expanded `docs/CONSUMER_GUIDE.md` with reference tables for the reusable exported types (provider/navigation, hook contracts, data DTOs, auth flow helpers, feedback, and connectivity types) and usage examples, steering consumers to import from `@sito/dashboard-app` instead of redefining locally.
- Added `useOnlineStatus` / `OfflineBanner` recipe and connectivity-type notes to `docs/RECIPES_FORMS.md`, plus layout/data recipe updates.

## [0.0.84] - 2026-05-30

### Added

- `APIClientAuthConfig` now supports `refreshMaxRetries`, `refreshRetryDelayMs`, `refreshRetryBackoffMultiplier`, and `refreshRetryCooldownMs` to tune access-token refresh retries.
- Added `authSessionError` helpers to normalize auth/session refresh failures and classify them as definitive vs retryable.

### Changed

- `APIClient` now retries transient refresh failures with backoff, applies a short cooldown after exhausted retryable failures, and preserves the existing refresh mutex behavior so concurrent requests still share one refresh flow.
- Pre-flight access-token refresh no longer forces session teardown on transient refresh failures when the current access token is still usable. Definitive auth/session failures still clear the stored session.
- `AuthProvider` now logs the user out only on definitive session recovery failures, preserving stored session state on transient network/service errors.

### Removed

- Removed the `minimatch` override from `package.json`, allowing the lockfile to resolve compatible dependency versions instead of forcing `10.2.2`.

## [0.0.83] - 2026-05-27

### Added

- `APIClient` now supports request-level auth control through `authMode?: "none" | "access-token"` and `requestConfig?: RequestConfig`, exposed via the new `APIClientRequestOptions` / `APIClientAuthMode` types.

### Changed

- Fixed REST session rehydration so `RestSessionAuthClient.getSession()` opts into the access-token refresh/retry flow instead of validating the current access token directly. When the access token is expired but the refresh token is still valid, session rehydration now refreshes and retries before failing.
- `APIClient` now resolves auth behavior per request. The constructor `secured` flag is still supported as a backward-compatible default, but is now deprecated in favor of request-level `authMode`.
- `BaseClient.secured` and the `secured` constructor parameter are now deprecated for the same reason: auth behavior should move toward request-level overrides on `api`.

### Documentation

- Updated the auth/client naming guidance and consumer docs to prefer `RestSessionAuthClient` and `RestAuthRecoveryClient`, while keeping `AuthClient` and `RestAuthApiClient` as backward-compatible aliases.

## [0.0.82] - 2026-05-26

### Added

- `Dialog` now accepts `closeOnBackdropClick?: boolean` (default `false`). When enabled, clicking the backdrop outside the modal content calls `handleClose`.

### Changed

- Base `Dialog` behavior no longer closes on outside click unless `closeOnBackdropClick` is explicitly enabled.

### Documentation

- Updated the consumer guide, form/dialog recipes, and theme/CSS notes to document `closeOnBackdropClick` and its default behavior.

## [0.0.80] - 2026-05-25

### Added

- `Onboarding` now supports horizontal swipe gestures via `@use-gesture/react`: swipe left advances, swipe right goes back, and navigation is clamped to the first/last step.
- `Onboarding` / `Step` now accept `alwaysHideIcon` as a boolean or per-action map. It forces label-only action buttons at every breakpoint, including mobile.
- Each entry in `Onboarding.steps` can also carry `alwaysHideIcon`, merged with the onboarding-level value using the existing per-action flag semantics.

### Changed

- `AuthSignInView` and `AuthSignUpView` no longer expose guest-mode actions (`guestLabel`, `guestAriaLabel`, `onStartAsGuest`). Guest entry is now owned by `Onboarding`.

### Documentation

- Updated onboarding recipes, consumer guide entries, and Storybook stories for `alwaysHideIcon` and horizontal swipe behavior.
- Updated prefab auth examples to remove guest-mode actions from sign-in/sign-up routes.

## [0.0.79] - 2026-05-24

### Added

- `Onboarding` / `Step` now expose `onClickBack` on non-first steps and render a Back button (FontAwesome `faArrowLeft`).
- `Onboarding` / `Step` accept `icons` (`{ back?, next?, skip?, startAsGuest?, signIn? }` overrides; defaults: `faArrowLeft`, `faArrowRight`, `faForward`, `faUserSecret`, `faRightToBracket`), plus display flags `alwaysShowIcon`, `alwaysHideLabel`, and `showLabelOnMobile`. Each flag accepts `boolean` (applies to all actions) or a per-action map (e.g. `showLabelOnMobile={{ startAsGuest: true }}` keeps next/back icon-only on mobile while showing the guest CTA label). Default responsive: icon-only below `28rem`, label-only above; icon-only buttons have auto width.
- Each entry in `Onboarding.steps` can also carry `icons`, `alwaysShowIcon`, `alwaysHideLabel`, and `showLabelOnMobile` to override the onboarding-level defaults on a per-step basis. Per-step values are merged on top of onboarding-level values per-action (step wins for the keys it defines; missing keys inherit).

### Changed

- `Empty.action` now accepts `ActionType<TRow> | ActionType<TRow>[]`. Passing an array renders one `Action` per entry (keyed by `id`) in declaration order. Single-action usage is unchanged (backward compatible).

### Removed

- `IndexedDBClient` and its public re-export. The offline-storage client, its test suite, and the related store-registry / open-lock helpers were dropped from the package. Consumers relying on offline persistence must provide their own browser-storage client (extending `BaseClient`-style contracts as needed).
- `IndexedDBClient` sections from `docs/CONSUMER_GUIDE.md`, `docs/RECIPES_DATA.md`, and `docs/TROUBLESHOOTING.md`; matching rules from `AGENTS.md` / `CLAUDE.md`.
- `clearIndexedDB` test setup helper (no longer needed by the test suite).

## [0.0.78] - 2026-05-22

### Added

- Phase 1 of the cross-app migration: shared app/layout primitives migrated from `wallet` and `period-calendar`:
  - `PwaUpdateDialog` (component) - presentational PWA update prompt. Consumers keep ownership of `needRefresh` / service-worker wiring and pass `open`, `onDismiss`, and `onUpdate`.
  - `NotFoundView` and `FeatureUnavailableView` (views) - generic fallback screens routed through `linkComponent` from `ConfigProvider`.
  - `DashboardFooter` and `DashboardHeader` (layouts) - shared authenticated app chrome. `DashboardHeader` owns drawer open/close state internally; `DashboardFooter` supports `ToTop` and bottom-nav spacing.
  - `AuthShell` and `AppShell` (layouts) - shared route shells with optional built-in `Notification` portal.
- New `src/views/` and `src/layouts/` source folders with matching TypeScript path aliases (`views`, `views/*`, `layouts`, `layouts/*`) wired in `tsconfig.json` and `vite.config.ts`.
- `Onboarding` gains optional `remountStepOnChange?: boolean` (default `false`). When `true`, the active step panel is remounted on every step change so CSS entry animations restart.
- `Onboarding` step entry animations now ship from the library (`src/components/app/Onboarding/styles.css`) through `onboarding-step-rise-in` and `onboarding-step-pop-in`, with `ConfigProvider.motion` and `prefers-reduced-motion` support.
- New generic `TopBanner` primitive in `components/ui/TopBanner`. Props: `visible?`, `children`, `color?`, `role?`, `ariaLive?`, and `className?`. Renders nothing when `visible={false}` and maps color tokens to the existing CSS variables.
- Phase 2 of the cross-app auth migration: shared side-channel auth endpoint adapters and DTOs:
  - `IAuthApiClient` for `forgotPassword`, `resetPassword`, `resendConfirmEmail`, and `confirmEmail`.
  - `RestAuthApiClient` for REST backends, accepting an existing `APIClient` instance or a `baseUrl`.
  - `SupabaseAuthApiClient` for Supabase password-reset and email-confirmation flows.
  - `ForgotPasswordDto`, `ResetPasswordDto`, `ResendConfirmEmailDto`, `ConfirmEmailDto`, and `AcceptedResponseDto`.
- Shared auth URL/token helpers in `src/lib/auth/utils.ts`: `buildAuthRedirectUrl`, `extractAuthQueryParamFromLocation`, `extractRecoveryAccessTokenFromLocation`, `extractAuthSessionTokensFromLocation`, `hasAuthErrorParamsInLocation`, `getAuthErrorMessage`, and the resolver helpers for confirmation/password-reset DTOs.
- Canonical `AuthRouteQueryParam` and `AuthRouteQueryParamType` const maps in `src/lib/auth/types.ts`.
- Generic form payload types in `src/lib/auth/forms.ts`: `SignInFormType<TExtra>`, `SignUpFormType<TExtra>`, `UpdatePasswordFormType`, and `RecoveryFormType`.
- Phase 2.5 of the cross-app auth migration: `SupabaseAuthClient`, a Supabase Auth adapter mirroring the `AuthClient` REST contract (`login`, `refresh`, `register`, `getSession`, `logout`) plus `signUp()` returning a discriminated `SupabaseSignUpResult`.
- `IAuthClient` interface for the shared session-endpoint contract implemented by both `AuthClient` and `SupabaseAuthClient`. `IManager.auth` is now typed as `IAuthClient`.
- Phase 2.6 of the cross-app auth migration: shared session-state hook `useAuthSessionState`, now composed by both `AuthProvider` and `SupabaseAuthProvider` to centralize storage-key resolution, account state, guest-mode state, stored-session cleanup, and `logUser`.
- Shared auth UI components in `components/app/Auth`: `AuthScreenShell`, `AuthFormShell`, and `AuthResultView`.
- Shared auth views exported from `src/views`: `AuthSignInView`, `AuthSignUpView`, `AuthRecoveryView`, `AuthSignUpConfirmationView`, `AuthUpdatePasswordView`, `AuthConfirmEmailSuccessView`, and `AuthConfirmEmailErrorView`.
- Auth flow hooks in `src/hooks/auth`: `useUpdatePasswordFlow` and `useConfirmEmailFlow`, plus shared auth-flow status types/constants.
- `useFormDialogConfirmation` and `confirmation` support for `usePostDialog` / `usePutDialog`, allowing create/edit form dialogs to pause a mutation behind a `ConfirmationDialog`.
- Phase 3 of the cross-app migration: i18n-agnostic legal/info primitives migrated from `wallet` and `period-calendar` `views/Info/*`:
  - `LegalPage` (`src/views/LegalPage/LegalPage.tsx`) - shell with `title`, optional `intro` slot, and `children` slot for composable cards. No `sections` prop; apps compose with `LegalSection` directly.
  - `LegalSection` (`src/views/LegalPage/LegalSection.tsx`) - titled rounded-card primitive (`<article>` + `h3` + body slot).
  - `LegalLinksList` (`src/views/LegalPage/LegalLinksList.tsx`) - bulleted list of `{to, label}` links. Navigation routes through `linkComponent` from `ConfigProvider`. Renders nothing when `links` is empty.
  - `richTextComponents` (`src/views/LegalPage/richTextComponents.tsx`) - default styled component map (`p`, `strong`, `em`, `ul`, `ol`, `li`, `a`, `code`) to pass to `react-i18next` `<Trans components={...}>`. Library does not depend on `react-i18next`.
  - Public CSS class names: `legal-page{,-title,-intro}`, `legal-section{,-title,-body}`, `legal-links-list{,-item,-link}`.

### Changed

- Reorganized `src/components/` into two tiers:
  - `components/ui/` — generic primitives (`Buttons`, `Clock`, `Dialog`, `Empty`, `Error`, `Form`, `Loading`, `Palette`, `PrettyGrid`, `TabsLayout`, `TopBanner`).
  - `components/app/` — high-level/shell pieces coupled to providers, routing, or domain (`BottomNavigation`, `Drawer`, `Navbar`, `Notification`, `OfflineBanner`, `Onboarding`, `Page`, `PwaUpdateDialog`).
  - Moves are pure relocations done with `git mv` (history preserved). Public exports from `@sito/dashboard-app` are unchanged — consumers do not need code changes.
  - Internal path-alias imports (`components/X`) were rewritten to `components/ui/X` or `components/app/X`. CSS `@reference` paths were bumped by one level accordingly.
- Refactored `OfflineBanner` to compose `TopBanner` instead of duplicating banner markup/styles. `OfflineBanner` is intentionally a predefined preset of `TopBanner` — its color is hardcoded to `warning` and not exposed as a prop. Public API stays the same as before (`isOnline?`, `message?`, `className?`). The internal `offline-banner` class was removed; the rendered banner now uses `top-banner` + `top-banner--warning`. For ad-hoc banners with different colors, use `TopBanner` directly.
- Phase 1 migrated components now use local `styles.css` files (per `docs/ARCHITECTURE_RULES.md`) instead of inline Tailwind utility strings. New semantic class names: `pwa-update-dialog-{container,description,actions}`, `not-found-view{,-title,-body,-cta}`, `feature-unavailable-view{,-icon,-title,-body,-cta}`, `dashboard-footer{,--bottom-nav-spacing,-text}`. Project classes (`appear`, `button`, `primary`, `submit`) remain composed at the JSX site since they are not Tailwind utilities. `DASHBOARD_FOOTER_CLASSNAMES` in `constants.ts` now maps to the new semantic class names; public component API and default `containerClassName` behavior are preserved (`DashboardHeader`, `AuthShell`, `AppShell` had no inline Tailwind to extract).

### Documentation

- Cut `AGENTS.md` from 1036 lines to roughly 230 (~78% reduction). Removed code examples that duplicate `README.md`; preserved canonical agent rules, reference tables, and docs:check policy markers (provider order, IconButton contract, Node `.nvmrc` alignment, Base Library version).
- Split recipe documentation into `docs/RECIPES.md` as an index plus `docs/RECIPES_LAYOUT.md`, `docs/RECIPES_DATA.md`, and `docs/RECIPES_FORMS.md`.
- Added Phase 1/2/3 cross-app migration guidance across `AGENTS.md`, `README.md`, `docs/CONSUMER_GUIDE.md`, `docs/ARCHITECTURE_RULES.md`, `docs/THEME_AND_CSS.md`, and `docs/TROUBLESHOOTING.md`.
- Documented the `components/ui/` vs `components/app/` split, shared auth adapters/helpers, shared auth views, legal/info primitives, app/layout shells, onboarding animations, and PWA update dialog ownership boundaries.

## [0.0.77] - 2026-05-18

### Added

- Added global motion control to `ConfigProvider` through `motion?: "auto" | "none" | "always"`.
- Added reduced-motion aware animation handling for shared `.animated` transitions:
  - `motion="auto"` respects `prefers-reduced-motion`
  - `motion="none"` disables library transitions and animations
  - `motion="always"` forces library transitions even when reduced motion is requested by the OS/browser
- Added Storybook motion scenarios for `Dialog`:
  - `MotionAuto`
  - `MotionNone`
  - `MotionAlways`

### Changed

- Refactored `ConfigProvider` to comply with `docs/ARCHITECTURE_RULES.md` by moving it into a feature folder with:
  - `ConfigProvider.tsx`
  - `constants.ts`
  - `utils.ts`
  - `index.ts`
- Updated shared animation usage so components can opt into the common `.animated` transition utility instead of duplicating transition declarations.
- Updated `ToTop` tests to assert relevant class tokens instead of exact class-name strings, keeping coverage stable after adding shared animation classes.

### Documentation

- Updated `README.md` and `AGENTS.md` to document `ConfigProvider.motion` and its interaction with `prefers-reduced-motion`.

## [0.0.75] - 2026-05-17

### Added

- `ImportDialog` now accepts an optional `extraFields: ReactNode` slot rendered between the preview and `DialogActions` for custom inputs (checkboxes, selects, notes).
- `useImportDialog` gains an optional third generic `TExtra` plus:
  - `defaultExtra?: TExtra` — initial value for the extra fields, also used to reset on close/submit.
  - `renderExtraFields?: ({ values, setValue, setValues }) => ReactNode` — hook-managed render prop wired into `ImportDialog` via the `extraFields` slot when spreading the hook result.
  - `mutationFn` is typed as `ImportDto<TPreview> & TExtra`; the hook merges extra values into the payload as `{ items, override, ...extra }`.
- New `ExportDialog` component for optional export-config flows (date range, format, columns) — accepts `extraFields`, `extraActions`, and `mobileFullScreen`.
- New `useExportDialog<EntityDto, TExtra, TOutput>` hook with `defaultExtra`/`renderExtraFields` and `mutationFn(extra)`. Returns an `action()` factory with the same `ActionType` shape as `useExportAction`, so consumers can opt in/out of the dialog per entity without changing the call site.
- Shared `hooks/dialogs/shared` module with `EMPTY_EXTRA`, `resolveInitialExtra`, `createExtraSetter`, `ExtraFieldsContext`, and `RenderExtraFields` reused by both import and export dialog hooks.
- Navigation menu contracts now support optional access guards:
  - `AccessGuard = (account?: SessionAccountDto) => boolean`
  - `access?: AccessGuard` on `ViewPageType`, `MenuItemType`, and `SubMenuItemType`
  - `Drawer` now filters both top-level items and nested children against the current account.
- `ImportPreviewDto` now supports `willCreate?: boolean` and `conflict?: boolean` so import previews can express more than the existing/non-existing state.
- Storybook coverage: `Components/Dialog/ImportDialog/WithExtraFields`, `Components/Dialog/ExportDialog/WithExtraFields`, and `Hooks/Dialogs/ImportDialogs/WithExtraFields`.

### Changed

- Refactored `useImportDialog` into a per-feature folder (`hooks/dialogs/useImportDialog/`) with sibling `types.ts`, `constants.ts`, and `utils.ts` to comply with `docs/ARCHITECTURE_RULES.md` §7. Shared helpers moved to `hooks/dialogs/shared` and re-exported.
- `BaseClient` now accepts two optional output generics:
  - `TMutationOutputDto` for `insert`, `insertMany`, and `update`
  - `TGetByIdDto` for `getById`
    This allows mutation/detail endpoints to return shapes that differ from the list DTO without requiring consumer-side casts.
- `SessionDto` is now generic (`SessionDto<TExtra>`) so auth/session payloads can carry extra backend fields while preserving the base session contract.
- `ImportDialog` preview now shows compact status chips for `existing`, `willCreate`, and `conflict` counts above the JSON preview.
- Refined onboarding step layout with centered step content and balanced titles on narrow screens.

### Documentation

- Updated `README.md`, `AGENTS.md`, `docs/CONSUMER_GUIDE.md`, `docs/RECIPES.md`, and `docs/THEME_AND_CSS.md` to document the new import/export dialog extension points.

## [0.0.74] - 2026-05-11

### Added

- Added provider composer APIs for shared app wiring:
  - `AppProviders` component to compose the base stack:
    `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider`.
  - `createAppProviders(config)` factory for static/preconfigured provider trees.
  - `AppProviderSlot` contract to inject optional wrapper providers (`featureFlagsProvider`, `offlineSyncProvider`, `appWrapperProvider`).
- Added optional toggles in `AppProviders`:
  - `auth={false}` to disable auth wiring.
  - `withNavbarProvider` and `withBottomNavActionProvider` to enable optional UI providers.
- Added provider-composer test coverage in `src/providers/AppProviders.test.tsx`.

- Extended online-status API in `hooks/useOnlineStatus`:
  - `useOnlineStatusSnapshot(options?)` for full connectivity snapshot (`isBrowserOnline`, `isServerReachable`, `isOnline`, `isChecking`, `lastCheckedAt`).
  - `probeServerReachability(options?)` to run a probe and update shared snapshot state.
  - `setServerReachable(value)` to manually update server reachability state.
  - `configureOnlineStatus(options?)` to configure probe runtime defaults (interval, URL, timeout, method, request init, response resolver).

### Changed

- `configureOnlineStatus` now replaces runtime probe configuration per call instead of merging with previous values, preventing cross-use configuration carry-over.
- `useOnlineStatus` is now implemented on top of `useOnlineStatusSnapshot`, preserving its existing return contract while sharing a centralized snapshot/probe store.

### Documentation

- Updated `README.md`, `AGENTS.md`, and `docs/CONSUMER_GUIDE.md` with provider-composer usage and extension points.
- Updated `README.md` offline-status section to document the extended online-status API and no-carry configuration behavior.

## [0.0.73] - 2026-05-03

### Added

- `FormContainer` now supports action customization without breaking current defaults:
  - `onCancel` to override the default cancel behavior (`reset()` fallback remains unchanged when not provided).
  - `submitLabel` and `cancelLabel` for custom action texts.
  - `submitDisabled` and `cancelDisabled` for independent disabled-state control.
  - `actionsClassName` for action-row layout/style overrides.
  - `renderActions` slot for fully custom action rendering.
- Added Storybook coverage for new `FormContainer` action APIs:
  - `CustomLabelsAndDisabled`
  - `CustomActionsSlot`

### Changed

- `FormDialog` type contract now explicitly excludes the new `FormContainer` action customization props (`onCancel`, labels, disabled overrides, `actionsClassName`, `renderActions`) so its public API remains unchanged for now.

### Documentation

- Updated `docs/CONSUMER_GUIDE.md` component props table to include the new `FormContainer` action customization surface.

## [0.0.72] - 2026-04-26

### Fixed

- `ImportDialog` now renders the parse error block only when `parseError` exists, avoiding an unnecessary empty error placeholder in the normal flow.
- Updated `ImportDialog` error message styling utility from `text-error` to `text-bg-error` to align with the current token/class usage.

## [0.0.71] - 2026-04-19

### Fixed

- `IndexedDBClient` now supports multiple clients (different stores) sharing the same `dbName` without clobbering each other's object stores. Previously, opening a second client with a new `table` under an existing database could leave earlier stores missing or trigger `NotFoundError` on CRUD calls.
- `IndexedDBClient.open` is now serialized per `dbName` via an internal lock, preventing races between concurrent `open()` calls that could fire overlapping `onupgradeneeded` events.
- `IndexedDBClient` now probes the existing database version/stores before opening, bumps the version only when required stores are missing, and recreates all registered stores in a single `onupgradeneeded` pass.
- `IndexedDBClient` now rejects explicitly on `onblocked` events during probe/upgrade instead of hanging.

### Added

- Internal store registry and open-lock utilities in `IndexedDBClient` so every client instance contributes its `table` to the shared schema for its `dbName`.
- New `IndexedDBClient` test suite "Shared database across multiple stores" covering concurrent multi-store inserts and late-registered stores with prior data preserved.

## [0.0.67] - 2026-04-15

### Added

- Added `SupabaseAuthProvider` Storybook race scenarios in `src/providers/Supabase/SupabaseAuthProvider.stories.tsx`:
  - `Race Reproduction (No SIGNED_IN Event)`
  - `Control Case (SIGNED_IN Event Enabled)`
- Added regression coverage in `SupabaseAuthProvider.test.tsx` to ensure a stale `getSession() -> null` bootstrap response cannot clear a newer `SIGNED_IN` session.

### Fixed

- Fixed a Supabase auth race condition where `SupabaseAuthProvider` could clear in-memory/local session state when an older bootstrap `getSession()` call resolved after a newer sign-in/auth-state update.
- `SupabaseAuthProvider` now guards bootstrap/auth-read responses with an internal auth revision check, ignoring stale responses instead of overwriting newer state.
- `SupabaseAuthProvider` now subscribes to `onAuthStateChange` before bootstrapping `getSession()` to reduce first-mount timing windows between auth events and bootstrap reads.

## [0.0.66] - 2026-04-15

### Changed

- Bumped package version to `0.0.66`.

### Fixed

- `usePutDialog` now enables id hydration with `id = 0` and consistently rehydrates form state when reopening an already-cached entity id.
- `AuthProvider` and `SupabaseAuthProvider` now use `SessionAccountDto` for partial in-memory session state and await `logoutUser()` in session-recovery error paths.
- `IndexedDBClient.insertMany` now fails fast on empty batches with a clear `insertMany requires items` error.
- `IndexedDBClient.get` now guards invalid pagination input and falls back to default page size when `pageSize <= 0`, avoiding `totalPages = Infinity`.
- REST query serialization and Supabase filtering now skip object filters when object `id` is missing/empty instead of applying empty-string equality filters.
- `Location` now allows optional `state` and `key`, aligning the type contract with `window.location` usage in docs/examples.

### Known Issues

- `BaseEntityDto` declares `createdAt`/`updatedAt`/`deletedAt` as `Date`, but the default REST client path returns parsed JSON payloads without date normalization, creating a runtime/type-contract mismatch for consumers.

## [0.0.63] - 2026-04-10

### Changed

- Bumped package version to `0.0.63`.
- Updated documentation dependency references to `@sito/dashboard@^0.0.76` across `README.md`, `AGENTS.md`, and `docs/CONSUMER_GUIDE.md` to align with package runtime dependencies.
- Split lint behavior into read-only validation and explicit autofix:
  - `npm run lint`: `eslint` + `prettier --check` + `depcheck` (no file mutations).
  - `npm run lint:fix`: `eslint --fix` + `prettier --write`.
- Updated `format` script to `prettier --write .` for consistent full-repo formatting behavior.
- Simplified CI workflow scope to remove duplicate checks:
  - `.github/workflows/ci.yml` now runs `test + build`.
  - `.github/workflows/lint.yml` remains responsible for `lint + docs:check` and now runs on `pull_request`.
- Relaxed peer dependency version constraints to compatible semver ranges (`<next major>`) for Font Awesome, React Query, Supabase, and React Hook Form to reduce consumer dependency resolution conflicts.

### Fixed

- Renamed internal providers module path from `Supbase` to `Supabase` and updated provider-barrel exports accordingly.
- Removed duplicate `Drawer` re-export from `src/components/index.ts`.

### Documentation

- Added automated docs policy validation in `scripts/check-docs.mjs` to enforce `@sito/dashboard` version alignment between `package.json`, `README.md`, `AGENTS.md`, and `docs/CONSUMER_GUIDE.md`.
- Updated README script and CI sections to reflect the new non-mutating lint flow and deduplicated pipeline responsibilities.

## [0.0.62] - 2026-04-09

### Changed

- Moved `@sito/dashboard@^0.0.75` from `peerDependencies` to `dependencies` so consumer apps do not fail with unresolved `@sito/dashboard` when only installing `@sito/dashboard-app`.
- Tightened provider/context hook contracts:
  - `useConfig` now uses an `undefined` default context and throws `useConfig must be used within ConfigProvider` when missing.
  - `useManager`, `useAuthContext`, `useNotification`, and `useSupabase` now expose consistent provider-specific error messages.
  - `useNavbar` now throws when `NavbarProvider` is missing instead of silently using no-op defaults.
- Improved provider hook inline docs (JSDoc) with explicit return types and `@throws` semantics.
- Updated related test expectations to match the new error messages and added explicit coverage for `useNavbar` outside `NavbarProvider`.

### Fixed

- Fixed `useRegisterBottomNavAction` stability when consumers pass inline action objects:
  - registration now derives a stable comparison key to avoid unnecessary re-registration churn.
  - hook cleanup now runs on unmount via a dedicated effect.
- Fixed React ref render-phase mutation warning by moving `latestActionRef` synchronization to an effect instead of mutating `ref.current` during render.

## [0.0.61] - 2026-04-08

### Changed

- Bumped package version to `0.0.61`.
- Refactored class-name composition across UI components (`BottomNavigation`, `Dialog*`, `Drawer`, `Error`, `FormContainer`, `ParagraphInput`, `Navbar`, `Notification`, `Page`, `PrettyGrid`, `TabsLayout`, `ToTop`, `SplashScreen`) to use `classNames` from `@sito/dashboard` instead of template-literal string concatenation.
- Consolidated shared onboarding classes (layout, spacing, typography, and responsive breakpoints used by multiple consumer dashboards) into `src/components/Onboarding/styles.css` as component-owned defaults.
- Updated peer dependency `@sito/dashboard` to `^0.0.75`.
- Relaxed React peer ranges to `react@>=18.2 <20` and `react-dom@>=18.2 <20`.
- Updated `some-javascript-utils` dependency spec to `^0.10.10`.

### Fixed

- Fixed className whitespace/empty-token edge cases caused by manual string concatenation when optional classes were missing.

### Documentation

- Updated peer dependency references in `README.md`, `docs/CONSUMER_GUIDE.md`, and `AGENTS.md` to `@sito/dashboard@^0.0.75`.

## [0.0.60] - 2026-03-31

### Added

- Added `BottomNavActionProvider` exports to `providers` and package public API.
- Added `useOptionalBottomNavAction` and expanded `useRegisterBottomNavAction` usage to support dynamic center-action registration from page scope.
- Added `BottomNavigation` Storybook coverage for dynamic center-action override (`WithDynamicCenterActionOverride`).
- Added `BottomNavigation` test coverage for provider-based center-action override and callback-only registration compatibility.

### Changed

- Updated `BottomNavigation` to consume `BottomNavActionProvider` context when available and merge registered center-action fields over `centerAction` props.
- Updated bottom-nav action registration to support either:
  - a full center-action descriptor object
  - a callback-only registration (`() => void`)
- Kept provider usage optional so existing `BottomNavigation` usage without `BottomNavActionProvider` still works.

### Fixed

- Fixed incomplete bottom-nav action integration that could cause runtime failures due to missing hook wiring.

### Documentation

- Updated `README.md`, `docs/CONSUMER_GUIDE.md`, and `docs/RECIPES.md` with:
  - optional `BottomNavActionProvider` setup guidance
  - dynamic center-action registration examples with `useRegisterBottomNavAction`
  - provider-order notes for app-shell integration

## [0.0.59] - 2026-03-31

### Added

- Added `BottomNavigation` for mobile navigation with typed `items`, optional `centerAction`, and customizable active matching via `isItemActive`.
- Added `BottomNavigation` public exports and related types to the package component surface.
- Added Storybook scenarios and unit tests for `BottomNavigation`, including active-state rendering, disabled items, and center-action navigation behavior.

### Changed

- Improved inline API documentation coverage (JSDoc/type-level docs) across components, hooks, providers, and API utilities.
- Renamed `ImportDialog` internal reducer aliases to explicit `ImportState` and `ImportAction` for clearer typing and safer imports.

### Fixed

- Fixed a `0.0.59` build issue in `ImportDialog` caused by ambiguous internal `State`/`Action` type alias imports.

### Documentation

- Added `BottomNavigation` explanation and usage examples in `README.md`, `docs/CONSUMER_GUIDE.md`, and `docs/RECIPES.md`.

## [0.0.58] - 2026-03-31

### Added

- Added `useOptionalAuthContext` in `providers/Auth/authContext` to support auth-aware wrappers without requiring `AuthProvider`.
- Added regression coverage for auth-optional wrapper behavior:
  - `Drawer.test.tsx` now validates guest rendering when auth context is missing.
  - `Onboarding.test.tsx` now validates "Start as guest" flow without auth context.

### Changed

- Refactored `Drawer` to consume optional auth context instead of strict `useAuth()`, defaulting to logged-out behavior when `AuthProvider` is not mounted.
- Refactored `Onboarding` to consume optional auth context and call `setGuestMode` only when auth context is available.
- Preserved strict auth behavior for `useAuth()` (still throws outside `AuthProvider`), while making `Drawer`/`Onboarding` usable in no-auth app shells.

### Documentation

- Updated `README.md` provider guidance to distinguish auth-enabled setup from auth-optional wrapper usage.
- Updated `docs/TROUBLESHOOTING.md` checklist and auth troubleshooting notes to clarify when `AuthProvider` is mandatory vs optional.

## [0.0.57] - 2026-03-29

### Changed

- Standardized dialog mapper naming to `dtoToForm`/`formToDto` across dialog hooks and consumer-facing docs/examples.
- Updated `useFormDialog.dtoToForm` to receive source data (`dtoToForm: (data) => ...`) before returning transformed form values.

### Added

- Added explicit Storybook mapper demos in `Hooks/Dialogs/FormDialogs`:
  - `StateModeMapperNames`
  - `PutModeMapperNames`

### Documentation

- Updated dialog mapping examples in `README.md`, `docs/CONSUMER_GUIDE.md`, and `docs/RECIPES.md` to use `dtoToForm`/`formToDto`.

## [0.0.56] - 2026-03-28

### Added

- Added Storybook dialog-hook scenarios for open-time hydration:
  - `StateModeSetValuesOnOpen`
  - `StateModeReopenWithSubmittedValues`
- Added `useFormDialog` test coverage for open-time value hydration and precedence against `dtoToForm`.

### Changed

- Extended `useFormDialog.openDialog` to support object params (`{ id?, values? }`) so dialogs can be hydrated directly when opening.
- Restored dialog mapper naming to `dtoToForm`/`formToDto`
- Updated `useFormDialog.dtoToForm` signature to receive source data (`dtoToForm: (data) => ...`).

### Documentation

- Added examples for opening `useFormDialog` with explicit values (`openDialog({ values })`) and for re-opening with last submitted form values in `README.md`, `docs/CONSUMER_GUIDE.md`, and `docs/RECIPES.md`.
- Added cross-references to the new Storybook scenarios in `README.md`, `docs/CONSUMER_GUIDE.md`, and `docs/RECIPES.md`.

## [0.0.55] - 2026-03-27

### Documentation

- Clarified documentation source-of-truth boundaries:
  - `README.md` + `AGENTS.md` are canonical for `@sito/dashboard-app`.
  - `.sito/*` is internal upstream reference material for `@sito/dashboard`.
- Added explicit cross-doc context notes to prevent provider/IconButton contract mixups between `@sito/dashboard` and `@sito/dashboard-app`.
- Updated `CLAUDE.md` documentation policy and aligned canonical provider-order wording.
- Added automated docs consistency checks (`npm run docs:check`) and wired them into CI workflows.
- Added a PR template checklist to enforce docs alignment and guard against regressions.
- Added explicit dialog-hook migration guidance (`useFormDialog` legacy -> `usePostDialog`/`usePutDialog`) with before/after snippets and `onError` usage in `README.md` and `docs/CONSUMER_GUIDE.md`.

### Breaking

- Refactored `useFormDialog` to core lifecycle mode only (`state`/`entity`) and removed legacy entity-coupled compatibility signatures/aliases.
  - Removed legacy `useFormDialog` props: `mutationFn`, `queryKey`, `getFunction`, `dtoToForm`, `formToDto`.
  - Removed deprecated aliases:
    - `useFormDialogLegacy`
    - `useEntityFormDialog`

### Changed

- Added core `useFormDialog.onError(error, context)` support for submit/apply/clear failures, including phase metadata (`"submit" | "apply" | "clear"`).
- Updated `usePostDialog`/`usePutDialog` internals to consume the simplified `useFormDialog` generic signature.

## [0.0.54] - 2026-03-26

### Changed

- Declared `@supabase/supabase-js` in both `peerDependencies` (optional) and `devDependencies` to keep consumer opt-in behavior while supporting local test tooling.

### Fixed

- Fixed `AuthProvider` test mocking path in `AuthProvider.test.tsx` so `useManager` is mocked from the correct module (`../ManagerProvider`).
- Fixed `SupabaseAuthProvider` test setup in `SupabaseAuthProvider.test.tsx` by mocking `useSupabase` from `SupabaseContext` and returning a stable mocked client reference to avoid repeated effect churn and flaky call-count/timeouts.

### Documentation

- Added a Supabase entity-client example (`ProductsSupabaseClient`) in `README.md`, showing how to extend `SupabaseDataClient` with typed DTO/filter/import contracts.
- Added compatibility and incremental migration notes for mixed backend rollout (`BaseClient` + `SupabaseDataClient`) and auth-provider switching guidance.
- Updated `planning/supabase-phased-plan.md` status checklist and aligned soft-delete filter wording to `deletedAt?: Date | null` + `softDeleteScope` (`ACTIVE`/`DELETED`/`ALL`).

## [0.0.53] - 2026-03-25

### Added

- Added `extraActions?: ButtonPropsType[]` support for `ConfirmationDialog`, `FormDialog`, and `ImportDialog` by forwarding custom actions to `DialogActions`.
- Added dialog component test coverage for `extraActions`:
  - `DialogActions.test.tsx`
  - `FormDialog.test.tsx`
  - extended `ConfirmationDialog.test.tsx` and `ImportDialog.test.tsx`
- Added Storybook `WithExtraActions` stories for:
  - `DialogActions`
  - `ConfirmationDialog`
  - `FormDialog`
  - `ImportDialog`

### Documentation

- Updated `README.md` with dialog `extraActions` usage notes and examples.
- Updated `docs/CONSUMER_GUIDE.md` component table/examples to include dialog `extraActions`.

## [0.0.51/0.0.52] - 2026-03-24

### Added

- Added a new generic form-dialog core mode (`mode: "state" | "entity"`) in `useFormDialog` so it can also drive local/state-only dialog workflows (filters, settings, feature flags), not only mutation-driven CRUD flows.
- Added `usePostDialog` as the recommended create (POST) wrapper on top of `useFormDialog`.
- Added `usePutDialog` as the recommended edit (PUT) wrapper on top of `useFormDialog`, including `getFunction` hydration and optional `dtoToForm`/`mapOut` mapping support.
- Added `useFormDialog` return helpers for state/entity workflows:
  - `mode`, `id`, `isSubmitting`, `onApply`, `onClear`
- Added a full test suite for the new dialog patterns:
  - `useFormDialog.test.tsx`
  - `usePostDialog.test.tsx`
  - `usePutDialog.test.tsx`
- Added Storybook examples for state/create/edit dialog flows in `FormDialogs.stories.tsx`.

### Changed

- Bumped package version to `0.0.52`.
- Updated `@sito/dashboard` peer/dev dependency to `^0.0.75`.
- Refactored dialog hook types to support both:
  - legacy entity-coupled `useFormDialog` usage
  - new core mode-based usage with `mapIn`/`mapOut`, `resetOnOpen`, `reinitializeOnOpen`, and submit/apply/clear handlers
- Exported `usePostDialog` and `usePutDialog` from the dialogs hooks index/public API.
- Added transitional aliases for entity usage:
  - `useFormDialogLegacy` (deprecated)
  - `useEntityFormDialog` (deprecated)

### Fixed

- Fixed `Page` floating action button class naming to use `page-fab` instead of `fab`, restoring the expected component-level style hook.

### Documentation

- Updated `README.md` hook list to include `useFormDialog`, `usePostDialog`, and `usePutDialog`.
- Updated `docs/CONSUMER_GUIDE.md` with new form-dialog patterns:
  - generic `useFormDialog` for local/state forms
  - `usePostDialog` for create flows
  - `usePutDialog` for edit flows
- Updated `docs/RECIPES.md` with end-to-end examples for state filters, create dialogs, and edit dialogs.

## [0.0.50] - 2026-03-19

### Changed

- Bumped package version to `0.0.50`.
- Updated auth DTO generic defaults to avoid over-constraining base fields:
  - `BaseAuthDto<TExtra extends object = object>`
  - `BaseRegisterDto<TExtra extends object = object, TAuthExtra extends object = object>`
  - `RegisterDto<TExtra extends object = object, TAuthExtra extends object = object>`

### Fixed

- Fixed a consumer-facing TypeScript compatibility issue where default auth/register DTO generics could collapse base fields like `email`, `password`, and `rPassword` to `never`.
- Added a type-focused regression test for default `AuthDto`, `BaseAuthDto`, `RegisterDto`, and `BaseRegisterDto` assignability.
- Fixed `APIClient.get()` error handling to reject non-2xx responses consistently with `doQuery`, `post`, `patch`, and `delete`, instead of potentially returning an invalid query result.
- Added a regression test covering failed `get()` responses without a populated `error` payload.
- Fixed `TabsLayout` link-mode fallback navigation for tabs without an explicit `to`, so the underlying `Tab` component can correctly fall back to `#id` instead of receiving an empty route.
- Added a regression test covering the default `#id` fallback for route-less tabs.
- Fixed `TabsLayout` controlled-mode tab clicks so internal state is only updated in uncontrolled usage; controlled usage now relies solely on `currentTab` from the parent.
- Added a regression test covering controlled `TabsLayout` behavior, ensuring tab clicks emit `onTabChange` without switching content until the parent updates state.
- Fixed `ManagerProvider` default React Query setup so each provider instance creates its own `QueryClient` instead of reusing a shared singleton across trees.
- Added a regression test covering `ManagerProvider` isolation between separate provider instances while preserving support for an injected `queryClient`.
- Updated ESLint ignores to exclude generated `storybook-static/**` output so `npm run lint` only checks source files.

### Documentation

- Updated `README.md` and `docs/CONSUMER_GUIDE.md` to clarify that `ManagerProvider` creates an isolated default `QueryClient` per provider instance, and that consumers can still inject a custom `queryClient` when they need shared cache state or custom React Query defaults.

## [0.0.49] - 2026-03-11

### Changed

- Bumped package version to `0.0.49`.
- Documentation-only release (no runtime/API behavior changes).

### Documentation

- Updated `README.md` to:
  - align runtime requirement with `.nvmrc` (Node 20)
  - include explicit peer dependency installation command
  - align provider setup example with `QueryClientProvider`, `DrawerMenuProvider`, optional `NavbarProvider`, and shared auth storage key config
  - document built-in auth refresh/retry behavior in `APIClient`/`BaseClient`
- Updated `AGENTS.md` to:
  - include Node runtime in the stack matrix
  - clarify optional `NavbarProvider` usage in provider setup guidance
  - fix malformed markdown code fences in hook examples
- Updated `CLAUDE.md` with explicit alignment rules for:
  - provider order and optional `NavbarProvider`
  - auth storage key consistency between `AuthProvider` and manager/client config
  - runtime version consistency with `.nvmrc`

## [0.0.48] - 2026-03-10

### Added

- `ToTop` customization props:
  - `threshold`, `scrollTop`, `scrollLeft`, `tooltip`, `scrollOnClick`, `onClick`, and optional `icon`
  - continues supporting `IconButton` visual props (`variant`, `color`, `className`, etc.)
- `ImportDialog` optional `renderCustomPreview?: (items?: EntityDto[] | null) => ReactNode`.
- `useImportDialog` support for `renderCustomPreview`, forwarded to `ImportDialog`.
- `PrettyGrid` optional infinite-scroll API:
  - `hasMore`, `loadingMore`, `onLoadMore`, `loadMoreComponent`, `observerRootMargin`, `observerThreshold`
  - sentinel class `pretty-grid-load-more`

### Changed

- `IndexedDBClient` update contract now aligns with `BaseClient`:
  - preferred `update(value)`
  - temporary backward compatibility for `update(id, value)`
- `IndexedDBClient` filtering now supports `deletedAt` boolean semantics:
  - `true` => deleted rows
  - `false` => active rows
  - strict equality remains for other keys
- `IndexedDBClient` connection lifecycle improvements:
  - added safe `close()`
  - `open()` now registers `db.onversionchange` to close stale connections
- Style alignment for overlapping class names defined in local reference CSS:
  - updated `Page`, `Navbar`, `Drawer`, `TabsLayout`, `Onboarding`, `PrettyGrid`, and `Buttons` CSS where selectors already existed in this package.

### Documentation

- Updated `AGENTS.md`, `CLAUDE.md`, and `README.md` for:
  - `ImportDialog`/`useImportDialog` custom preview support
  - `PrettyGrid` infinite-scroll usage
  - `IndexedDBClient` update/filter behavior
  - `ToTop` customization API

## [0.0.47] - 2026-03-09

### Added

- `CLAUDE.md` as a lightweight entrypoint for Claude-style agents, pointing them to the repository's canonical guidance files.

### Changed

- `TabsLayout` now supports controlled usage via `currentTab` and `onTabChange`, in addition to uncontrolled initialization with `defaultTab`.
- `Onboarding` steps now accept structured content (`title`, `body`, optional `content`, `image`, `alt`) instead of translation keys, and render as local button-driven tabs.
- `Onboarding` step copy is now consumer-provided rather than resolved from internal `_pages:onboarding.*` translations.
- Updated agent documentation (`AGENTS.md`, `CLAUDE.md`) to describe controlled tab flows and the intended offline `IndexedDBClient` usage pattern more clearly.

### Fixed

- `Onboarding` now drives `TabsLayout` with `currentTab`, so step progression stays in sync after the initial render.
- Adjusted the `IndexedDBClient` type definition to match the current offline client contract used by the package.

## [0.0.46] - 2026-03-08

### Added

- `Empty` Storybook story: `CustomMessage` to showcase custom empty-state copy.
- `TabsLayout` navigation mode props:
  - `useLinks?: boolean` (default `true`) to toggle between router links and local buttons.
  - `tabButtonProps` to customize tab button appearance/behavior when `useLinks={false}`.
- New `TabsLayout` stories:
  - `WithoutLinks`
  - `WithCustomTabButton`
- Expanded `Error` stories:
  - `WithRetry`
  - `WithCustomIcon`
  - `CustomContent`

### Changed

- `Error` component API is now hybrid:
  - Default mode supports icon/message/retry options (`error`, `message`, `iconProps`, `onRetry`, `retryLabel`, `retryButtonProps`, `messageProps`).
  - Custom mode supports fully custom content via `children`.
  - Modes are enforced with TypeScript union types to prevent mixing default props and `children`.
- `Error` retry action now renders with `Button` (from `@sito/dashboard`) instead of a native `<button>`.
- Updated Storybook translation mocks to include:
  - `_accessibility:actions.retry`
  - `_accessibility:errors.unknownError`
- Updated documentation (`README.md`, `AGENTS.md`) for:
  - `Error` usage modes
  - `TabsLayout` link-vs-button behavior
  - Peer dependency alignment to `@sito/dashboard@^0.0.68`

## [0.0.45] - 2026-03-01

### Added

- `IndexedDBClient<Tables, TDto, TCommonDto, TAddDto, TUpdateDto, TFilter, TImportPreviewDto>` — offline-capable browser storage client with the exact same method surface as `BaseClient`, backed by the browser's IndexedDB API. Intended as a drop-in offline fallback when the remote API is unreachable.
  - Supports: `insert`, `insertMany`, `update`, `get` (with pagination + sorting), `getById`, `export`, `import`, `commonGet`, `softDelete`, `restore`.
  - Constructor: `(table: Tables, dbName: string, version?: number)`. The object store is created automatically on first open.
  - Exported from `@sito/dashboard-app` alongside `BaseClient`.
- Full test suite for `IndexedDBClient` (`IndexedDBClient.test.ts`) covering `User`, `Account` (1 User → N Accounts), and `Transaction` (1 Account → N Transactions) entities — 29 tests across CRUD, pagination, sorting, filtering, soft-delete/restore, and full hierarchy scenarios.

## [0.0.44] - 2026-03-01

### Added

- `NavbarProvider` — new context provider for controlling the `Navbar` dynamically:
  - `title`: sets the navbar title per page
  - `setTitle(value: string)`: setter function
  - `rightContent`: injects a `ReactNode` into the navbar's right slot
  - `setRightContent(value: ReactNode)`: setter function
- `useNavbar` hook — consumes `NavbarContext` to read/set `title` and `rightContent`.

### Changed

- `Navbar` now reads `title` and `rightContent` from `NavbarProvider` context instead of props.
- Removed `showClock` prop from `Navbar`.

### Deprecated

- `Clock` component — extracted to its own `Clock/` folder and marked `@deprecated`. Will be removed in a future release.

## [0.0.43] - 2026-03-01

### Changed

- Prefab action hooks now expose sensible default values for `sticky`, `multiple`, `id`, `icon`, and `tooltip`, so they work out of the box without extra configuration:
  - `useDeleteAction`: `sticky = true`, `multiple = true`, `id = "delete"`, `icon = faTrash`, tooltip auto-translated.
  - `useEditAction`: `sticky = true`, `id = "edit"`, `icon = faPencil`, tooltip auto-translated.
  - `useRestoreAction`: `sticky = true`, `multiple = false`, `id = "restore"`, `icon = faRotateLeft`, tooltip auto-translated.
  - `useExportAction` / `useImportAction`: `hidden = false`, `disabled = false`, `isLoading = false` (unchanged, already defaulted).

## [0.0.42] - 2026-03-01

### Changed

- Removed local `Actions` component family (`Action`, `Actions`, `ActionsDropdown`) — now delegated entirely to `@sito/dashboard`.
- Updated `@sito/dashboard` dependency to `^0.0.67`.
- Added `.sito/dashboard.md` upstream reference documentation.

## [0.0.41] - 2026-02-28

### Fixed

- Fixed prefab actions hook behavior.
- Fixed label rendering issue on `ParagraphInput`.

## [0.0.40] - 2026-02-28

### Changed

- Refactored component file structure for better organization.
- Refactored styles and actions across multiple components.
- Refactored `Drawer`, `Dialog`, `Inputs`, and `ErrorComponent`.

### Fixed

- Fixed `SplashScreen` loading types.
- Fixed navbar tests and navbar rendering.
- Fixed notification handling.
- Fixed missing translations in stories.
- Fixed children duplication caused by prop spread.
- Fixed `onClick` handler on action items.

## [0.0.39] - 2026-02-23

### Added

- New `ActionsDropdown` component with Storybook story.
- Extended test suite:
  - `Actions.test.tsx`
  - `ConfirmationDialog.test.tsx`
  - `Navbar.test.tsx`
  - `useDeleteAction`, `useEditAction`, `useExportAction`, `useImportAction`, `useRestoreAction`
  - `useDialog`, `useScrollTrigger`
- Added `.nvmrc` pinned to Node 20.

### Changed

- `ActionsDropdown` now uses `IconButton`, `Button`, and `Dropdown` from `@sito/dashboard`.
- Added `className` prop to `ActionsDropdown` trigger.

### Fixed

- Fixed stories and notification rendering.
- Fixed `ActionsDropdown` Storybook story.

## [0.0.38] - 2026-02-20

### Changed

- Updated `@sito/dashboard` dependency to `^0.0.63`.

### Fixed

- Fixed missing `aria-label` attribute on interactive elements.

## [0.0.37] - 2026-02-19

### Added

- Upstream (`@sito/dashboard@0.0.62`): added a proper `changelog.md` for release tracking.

### Changed

- Updated `@sito/dashboard` dependency usage to `^0.0.62`.
- Upstream (`@sito/dashboard@0.0.62`): reworked `README.md` to provide consistent and accurate package usage examples.
- Upstream (`@sito/dashboard@0.0.62`): fixed imports to use `@sito/dashboard` as the public entrypoint.
- Upstream (`@sito/dashboard@0.0.62`): corrected `Table` action usage from array literal to callback form: `(row) => ActionType[]`.
- Upstream (`@sito/dashboard@0.0.62`): updated development instructions with valid commands from `package.json`.
- Upstream (`@sito/dashboard@0.0.62`): added explicit sections for project description, development setup, testing, and linting.
- Upstream (`@sito/dashboard@0.0.62`): added extra onboarding sections (`Peer dependencies`, `Additional useful scripts`, and `Contributing`).

## [0.0.36] - 2026-02-19

### Added

- GitHub Actions workflows:
  - `/.github/workflows/lint.yml` to run lint on `push` and `pull_request`
  - `/.github/workflows/ci.yml` to run `lint + test + build`
- Husky pre-commit hook in `/.husky/pre-commit` to run `npm run lint`
- Automated testing stack with Vitest + Testing Library
- Initial test suite for:
  - API layer (`APIClient`, `BaseClient`, request utilities)
  - Providers (`AuthProvider`, `ConfigProvider`, `ManagerProvider`)
  - Utilities (`date`, `local`, `os`)

### Changed

- Migrated ESLint configuration to ESLint v9 flat config (`/eslint.config.js`)
- Removed legacy ESLint files (`/.eslintrc`, `/.eslintignore`)
- Updated Vite config to include Vitest test settings (`/vite.config.ts`)
- Updated documentation in `/README.md`:
  - new test scripts (`test`, `test:watch`)
  - CI status and validation flow
- Updated package metadata and dependencies for the testing/CI setup

### Fixed

- Fixed extensible auth header behavior in `APIClient`:
  - custom `tokenAcquirer` is now assigned in constructor
  - all secured requests now use `this.tokenAcquirer()` instead of hardcoded default acquirer
- Fixed runtime safety in provider contexts:
  - `ManagerProvider` and `AuthProvider` now use `createContext<T | undefined>(undefined)`
  - hooks now reliably throw when used outside provider boundaries
- Fixed several lint/runtime issues discovered during ESLint v9 migration
  - hook dependency issues
  - unused imports/helpers
  - minor consistency fixes across providers and components
