# AGENTS.md — @sito/dashboard-app

Agent guardrails for projects consuming **`@sito/dashboard-app`** (React 18 UI library on top of `@sito/dashboard`).
Public usage examples live in `README.md`. This file is canonical for agent behavior; do not duplicate setup snippets here.

---

## Documentation Scope

| Document     | Authority                                          |
| ------------ | -------------------------------------------------- |
| `README.md`  | Canonical for `@sito/dashboard-app` consumer usage |
| `AGENTS.md`  | Canonical for agent behavior in this repo          |
| `.sito/*.md` | Reference only (upstream `@sito/dashboard`)        |

Critical distinctions (override anything in `.sito/*`):

- Provider order: `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when `Navbar`/`useNavbar` used). Manual or via `AppProviders` / `createAppProviders`.
- Browser-only. **Not SSR-compatible.**
- `IconButton` is overridden — expects `icon: IconDefinition` (FontAwesome), not a React node.

---

## Tech Stack

| Layer        | Technology           | Version |
| ------------ | -------------------- | ------- |
| UI Framework | React                | 18.3.1  |
| Language     | TypeScript           | 5.7.2   |
| Runtime      | Node.js              | 20.x    |
| Styling      | Tailwind CSS         | 4.x     |
| Icons        | FontAwesome          | 7.0.0   |
| Forms        | React Hook Form      | 7.61.1  |
| Server State | TanStack React Query | 5.x     |
| Base Library | @sito/dashboard      | ^0.0.82 |

Peer install (consumer project):

```bash
npm install \
  react@18.3.1 react-dom@18.3.1 \
  @sito/dashboard@^0.0.82 \
  @tanstack/react-query@5.83.0 \
  react-hook-form@7.61.1 \
  @fortawesome/fontawesome-svg-core@7.0.0 \
  @fortawesome/free-solid-svg-icons@7.0.0 \
  @fortawesome/free-regular-svg-icons@7.0.0 \
  @fortawesome/free-brands-svg-icons@7.0.0 \
  @fortawesome/react-fontawesome@0.2.3
```

See `README.md` for: full provider setup, `AppProviders` composer, Supabase backend, component prop tables, hook signatures, `BaseClient` / `IndexedDBClient` / `SupabaseDataClient` extension, dialog/form/auth/notification examples, styling config.

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

### IndexedDB constraints

- Browser-only. Never instantiate in SSR/Node.
- `update(value)` is primary; legacy `update(id, value)` is temporary compat.
- Filtering uses **exact equality**. `deletedAt` is `Date | null`.
- `softDeleteScope`: `"ACTIVE"` | `"DELETED"` | `"ALL"`.
- `import` with `override: false` => `store.add` (throws on dup); `override: true` => `store.put` (upsert).
- Multiple clients can share a `dbName` — internal registry + open-lock handle shared-schema creation and concurrent opens. Effective version is `max(registered, current)`.

### Error type guards

```ts
import { isValidationError, isHttpError } from "@sito/dashboard-app";
```

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
13. **Use `IndexedDBClient` for offline fallback.** Reuse same `dbName` across related entity clients. Never in SSR/Node.
14. **Send `rememberMe` from sign-in** when the UI exposes a remember option.
15. **No ad-hoc token refresh.** Rely on centralized `APIClient`/`BaseClient` refresh/retry.
16. **Align auth storage keys** between `AuthProvider` and `IManager`/`BaseClient` auth config (`rememberKey`, `refreshTokenKey`, `accessTokenExpiresAtKey`).
17. **`Error` is single-mode.** Default props (`error`/`message`/`icon`/`onRetry`) OR `children` — never both.
18. **`TabsLayout` link mode intentional.** Links for routes; `useLinks={false}` + `tabButtonProps` for local state.
19. **`TabsLayout` controlled (`currentTab` + `onTabChange`)** when parent owns step state (onboarding, wizards). `defaultTab` only for uncontrolled initial selection.
20. **`Onboarding` steps are structured** (`title`, `body`, optional `content`/`image`/`alt`). No `_pages:onboarding.*` keys. Resolve i18n consumer-side.
21. **Use `ImportDialog` extension points** (`renderCustomPreview`, hook `defaultExtra`/`renderExtraFields`, component `extraFields`). No forks.
22. **Use `PrettyGrid` infinite scroll props** (`hasMore`, `loadingMore`, `onLoadMore`, `loadMoreComponent`, observer options). No grid forks.
23. **Use `ToTop` customization props** (`threshold`, target coords, `tooltip`, `icon`, `scrollOnClick`, `onClick`). No ad-hoc wrappers.
24. **Prefer `IndexedDBClient.update(value)`** in new code. `(id, value)` only for legacy compat.
25. **Keep Node version aligned with `.nvmrc`** in setup docs.
26. **Run `npm run docs:check`** after doc edits.
27. **Never document or propose SSR** for this package.
28. **Pick the right export flow** — direct (`useExportAction`) vs config dialog (`useExportDialog`). Both return the same `action()` shape. `useExportDialog` doesn't invalidate queries or auto-download.
