# Changelog

All notable changes to this project will be documented in this file.

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
