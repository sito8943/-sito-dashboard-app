# Project Guidelines

This repository publishes `@sito/dashboard-app`.
Agents must follow the files below before making changes.

@AGENTS.md
@.sito/dashboard.md
@README.md

When a change affects the public API or documented behavior:

- update `CHANGELOG.md`
- keep `AGENTS.md` and `CLAUDE.md` aligned
- keep `README.md` aligned with `AGENTS.md` for setup snippets and feature docs
- prefer examples that use the public package entrypoint (`@sito/dashboard-app`)
- keep provider setup docs aligned with current order:
  `QueryClientProvider` -> `ConfigProvider` -> `ManagerProvider` -> `AuthProvider` -> `NotificationProvider` -> `DrawerMenuProvider` (`NavbarProvider` when `Navbar`/`useNavbar` is used)
- keep auth storage key examples aligned between `AuthProvider` and `IManager`/`BaseClient` auth config
- keep runtime requirements aligned with `.nvmrc` (currently Node 20)
- keep `Onboarding` docs aligned with the current public API: `steps` are structured objects with `title`, `body`, optional `content`, `image`, and `alt`, not internal translation keys
- keep `ImportDialog` docs aligned with `renderCustomPreview` support (component + `useImportDialog` passthrough)
- keep `PrettyGrid` docs aligned with optional infinite-scroll props (`hasMore`, `loadingMore`, `onLoadMore`, `loadMoreComponent`, observer options)
- keep `IndexedDBClient` docs aligned with `update(value)` as primary contract, temporary `(id, value)` compatibility, and `deletedAt` boolean filter semantics
- keep `ToTop` docs aligned with customization props (`threshold`, target coordinates, icon, tooltip, and click behavior)
