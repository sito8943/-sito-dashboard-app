# Changelog

All notable changes to this project will be documented in this file.

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
- Updated `@sito/dashboard` peer/dev dependency to `^0.0.74`.
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
