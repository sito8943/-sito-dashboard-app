# Integration Recipes for `@sito/dashboard-app`

Copy-ready recipes split by theme. Pick the file matching your task.

| File                                       | Scope                                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RECIPES_LAYOUT.md`](./RECIPES_LAYOUT.md) | Provider bootstrap, `AppShell` / `AuthShell`, `DashboardHeader` / `DashboardFooter`, `BottomNavigation`, fallback views (`NotFoundView` / `FeatureUnavailableView`), `PwaUpdateDialog`, `useDrawerMenu`.                                                                                 |
| [`RECIPES_DATA.md`](./RECIPES_DATA.md)     | CRUD page (`Page` / `PrettyGrid` / action hooks), action primitives, entity clients (`BaseClient` / `IndexedDBClient` / `SupabaseDataClient`), shared `dbName`, exports (`useExportActionMutate` / `useExportDialog`).                                                                   |
| [`RECIPES_FORMS.md`](./RECIPES_FORMS.md)   | Form primitives (`useMutationForm`), form modals (`useFormDialog` / `usePostDialog` / `usePutDialog`), base `useDialog`, import flows (`ImportDialog` / `useImportDialog`), tabs/onboarding, navbar, feedback, notifications, auth, error guards, utility hooks, recipe recommendations. |

Notes:

- Provider order is canonical: see `RECIPES_LAYOUT.md` §1.
- Cross-file references use the form `RECIPES_LAYOUT.md §N`.
- Library is browser-only — never SSR.
