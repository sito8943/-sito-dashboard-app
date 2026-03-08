# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
