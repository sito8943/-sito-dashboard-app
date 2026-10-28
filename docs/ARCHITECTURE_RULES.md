# ARCHITECTURE_RULES

## Mandatory Pre-Work

All coding agents (Codex, Claude, or any automated contributor) **must read this file before making any code change**.

---

## 1) Scope

- These architecture rules are mandatory for this project.
- Any new feature, refactor, or file move must follow this document.
- If an exception is needed, document it explicitly in the implementation notes/PR.

---

## 2) State Management and Data Flow

- Use `Context + Provider` patterns to avoid prop-drilling.
- Do not pass shared state through multiple component levels unless it is strictly local UI state.
- Each domain should expose a provider and a typed access hook when needed.
- Keep business logic out of presentational components.

---

## 6) Folder Structure (Required)

Use this project structure as the default organization:

```txt
src/
  providers/      # App/domain providers and context wiring
  components/     # Reusable global components, grouped by atomic design level
    atoms/       # Standalone primitives
    molecules/   # Small compositions of atoms
    organisms/   # Large or provider/routing/domain-coupled pieces
  views/          # Route/page-level screens
  layouts/        # Shared layout shells used by views
  hooks/          # Reusable custom hooks
  lib/            # Core logic: models, managers, utils, services, constants
    models/
    utils/
  styles/         # Global styles (including global.css/theme definitions)
tests/            # Vitest suites mirroring src/ (components/<level>/, hooks/, lib/, …) + setup.ts
stories/          # Storybook stories: atoms/ molecules/ organisms/ hooks/ providers/ layouts/ views/ foundations/
```

Notes:

- `components/` is for shared/global UI blocks, not route-specific page composition.
- `components/atoms/` holds standalone primitives (`Buttons` — `IconButton`, `ToTop` —, `Clock`, `Loading`).
- `components/molecules/` holds small compositions of atoms (`Empty`, `Error`, `Form`, `TabsLayout`, `TopBanner`).
- `components/organisms/` holds large or provider/routing/domain-coupled pieces (`Dialog` with its `ImportDialog`/`ExportDialog` subfolders, `PrettyGrid`, `Auth`, `BottomNavigation`, `Drawer`, `Navbar`, `Notification`, `OfflineBanner`, `Onboarding`, `Page`, `PwaUpdateDialog`).
- Imports point down or sideways only: organisms may import molecules and atoms, molecules may import atoms, atoms never import molecules or organisms.
- Public surface stays unchanged: re-export every level from `src/components/index.ts`. Consumers never reach into `atoms/`/`molecules/`/`organisms/` directly.
- Decision rule when adding a new component: place it in the lowest level that fits what it composes; anything that needs a provider, routing primitive, or domain hook is usually an organism.
- Same layout as `@sito/ui` and `@sito/dashboard`. Where a component name exists upstream, keep the same level.

### Imports, tests and stories

- Imports that leave the current folder use the `@/` alias for `src/` with a specific path (`@/lib`, `@/components/atoms/Buttons`, `@/providers`); same-folder imports stay `./`.
- The alias is configured in `tsconfig.json` (and `tsconfig.node.json`), `vite.config.ts` (also used by Vitest) and `.storybook/main.ts`. `vite-plugin-dts` rewrites it, so the emitted `.d.ts` files contain relative paths — `dist` must never contain `@/` imports.
- CSS `@import` / `@reference` paths stay relative.
- Tests live in `tests/`, mirroring `src/` (`tests/components/<level>/<Name>/`, `tests/hooks/`, `tests/lib/`, …); the Vitest setup file is `tests/setup.ts`.
- Stories live in `stories/<level>/` (`atoms`, `molecules`, `organisms`) plus `stories/hooks`, `stories/providers`, `stories/layouts`, `stories/views` and `stories/foundations`. Component story titles start with `Atoms/…`, `Molecules/…` or `Organisms/…`.
- `views/` should focus on screen composition and orchestration.
- `layouts/` should hold reusable structures shared between multiple views.

---

## 7) Feature-Level File Structure (Mandatory)

When creating or refactoring hooks/components, use this per-feature structure:

```txt
FeatureName/
  FeatureName.tsx|ts   # Only one component or one hook per file
  constants.ts         # Constants only
  utils.ts             # Reusable helper functions only
  types.ts             # Type aliases and interfaces only
  index.ts             # Public exports
  styles.css           # Optional specific styles
```

Rules:

- One hook per file (`useSomething.ts`).
- One component per file (`Something.tsx`).
- Do not declare reusable helpers/constants/types inside component or hook files.
- Move helper functions to `utils.ts`.
- Move constants to `constants.ts`.
- Move interfaces/types to `types.ts`.
- Keep support files as siblings of the hook/component they support.
- If a hook/component grows, create its own folder and expose public API via `index.ts`.
- Preserve existing public imports by re-exporting from local `index.ts` files.
- In case of using tailwindcss define all classes on styles.css for better DX and use className utility function for merging classes

---

## 8) Routing Conventions (Mandatory)

- Centralize app routes in one shared file (for example: `src/lib/routes.ts`) using constant objects (`as const`).
- Do not hardcode route strings in `navigate(...)`, `<Link to=...>`, `<Route path=...>`, menu config, or sitemap config.
- For dynamic routes and query-based routes, expose helper functions (for example: `getShipRoute(id)`).
- Centralize query parameter keys in route constants (for example: `RouteQueryParam`) and reuse them consistently.

---

## 10) Implementation Discipline

- Prefer clear boundaries: UI layer, provider layer, domain logic layer.
- Prefer small, composable modules over monolithic files.
- Keep APIs typed and explicit.
- New features must follow these rules unless an exception is documented in the implementation notes/PR.
