# @sito/dashboard-app

`@sito/dashboard-app` is a React 18 component and utilities library for building Sito-style admin dashboards, CRUD screens, and internal tools. It packages UI components, hooks, providers, typed API helpers, and styles in a single npm package.

## Documentation scope and source of truth

Use documentation by target package:

| Document                | Primary audience              | Source of truth for                                     |
| ----------------------- | ----------------------------- | ------------------------------------------------------- |
| `README.md` (this file) | Consumer apps and maintainers | Public usage of `@sito/dashboard-app`                   |
| `AGENTS.md`             | AI agents and maintainers     | Implementation rules for `@sito/dashboard-app`          |
| `.sito/*.md`            | Internal team and agents      | Upstream reference notes for `@sito/dashboard` behavior |

Important:

- `.sito/*.md` is not the canonical integration guide for this package.
- `@sito/dashboard-app` is **not SSR-compatible**. Treat it as browser-only (client-rendered apps).
- For auth-enabled apps, use `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when needed; `BottomNavActionProvider` optional for dynamic mobile center actions).
- `Drawer` and `Onboarding` can run without `AuthProvider`; in that case they behave as guest-mode UI defaults.
- `IconButton` differs by package:
  - `@sito/dashboard`: `icon` accepts a React node.
  - `@sito/dashboard-app`: `icon` expects `IconDefinition` (FontAwesome wrapper export).

## Installation

```bash
npm install @sito/dashboard-app
# or
yarn add @sito/dashboard-app
# or
pnpm add @sito/dashboard-app
```

## Requirements

- Node.js `20.x` (see `.nvmrc`)
- Browser runtime only (no SSR/server rendering for this package)
- React `18.3.1`
- React DOM `18.3.1`
- `@tanstack/react-query` `5.83.0`
- `@supabase/supabase-js` `2.100.0` (optional; only if using Supabase backend)
- `react-hook-form` `7.61.1`
- `@sito/dashboard` `^0.0.82`
- Font Awesome peers defined in `package.json`

Install all peers in consumer apps:

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

If your app uses the Supabase backend:

```bash
npm install @supabase/supabase-js@2.100.0
```

## Core exports

- Layout and navigation: `Page`, `Navbar`, `Drawer`, `BottomNavigation`, `TabsLayout`, `PrettyGrid`, `ToTop`
- Layout shells: `AppShell`, `AuthShell`, `DashboardHeader`, `DashboardFooter`
- Reusable views: `NotFoundView`, `FeatureUnavailableView`
- Actions and menus: `Actions`, `Action`, `Dropdown`, button components
- Dialogs and forms: `Dialog`, `FormDialog`, `ImportDialog`, `ExportDialog`, `PwaUpdateDialog`, form inputs
- Feedback: `Notification`, `Loading`, `Empty`, `Error`, `Onboarding`, `OfflineBanner`, `TopBanner`
- Hooks: `useFormDialog` (generic state/entity), `usePostDialog`, `usePutDialog`, `useImportDialog`, `useExportDialog`, `useDeleteDialog`, `useMutationForm` (`usePostForm` deprecated alias), `useDeleteAction`, `useNavbar`, `useOnlineStatus`, `useOnlineStatusSnapshot`, and more — all action hooks ship with default `sticky`, `multiple`, `id`, `icon`, and `tooltip` values so only `onClick` is required
- Providers and utilities: `ConfigProvider`, `ManagerProvider`, `AppProviders`, `createAppProviders`, `SupabaseManagerProvider`, `AuthProvider`, `SupabaseAuthProvider`, `NotificationProvider`, `DrawerMenuProvider`, `NavbarProvider`, `BottomNavActionProvider`, `useBottomNavAction`, `useOptionalBottomNavAction`, `useRegisterBottomNavAction`, DTOs, API clients (`BaseClient`, `IndexedDBClient`, `SupabaseDataClient`), `useSupabase`, `filterMenuByFeatureFlags`, and `normalizeMenuDividers`

## Component usage patterns

### Error component

`Error` supports two modes:

- Default mode: icon + message + retry (uses `Button` internally)
- Custom mode: pass `children` for fully custom content

```tsx
import { Error } from "@sito/dashboard-app";

<Error
  error={error}
  onRetry={() => refetch()}
  retryLabel="Retry"
/>

<Error>
  <CustomErrorPanel />
</Error>
```

Do not combine default props (`error`, `message`, `onRetry`, etc.) with `children` in the same instance.

### TabsLayout link mode

`TabsLayout` renders route links by default (`useLinks = true`).
If your tabs are local UI state and should not navigate, set `useLinks={false}`.

```tsx
import { TabsLayout } from "@sito/dashboard-app";

<TabsLayout
  useLinks={false}
  tabButtonProps={{ variant: "outlined", color: "secondary" }}
  tabs={tabs}
/>;
```

`tabButtonProps` lets you customize each tab button style/behavior (except `onClick` and `children`, which are controlled by `TabsLayout`).

### Onboarding

`Onboarding` accepts structured steps instead of translation keys. Each step provides required `title` and `body`, plus optional `content`, `image`, and `alt`.
Step copy is provided by the consumer app, so any i18n for the step itself should be resolved before rendering `Onboarding`.

```tsx
import { Onboarding } from "@sito/dashboard-app";

<Onboarding
  steps={[
    {
      title: "Welcome",
      body: "This flow explains the main features.",
    },
    {
      title: "Almost done",
      body: "Add custom content when a step needs extra UI.",
      content: <MyStepContent />,
      image: "/images/setup.png",
      alt: "Setup preview",
    },
  ]}
/>;
```

The action buttons still use the package's internal accessibility/button translation keys.

### ImportDialog custom preview

`ImportDialog` supports optional custom preview rendering via `renderCustomPreview`.
If provided, it receives current parsed `previewItems` and replaces the default JSON preview.
If omitted, the default preview remains unchanged.

```tsx
import { ImportDialog } from "@sito/dashboard-app";

<ImportDialog<ProductImportPreviewDto>
  open={open}
  title="Import products"
  handleClose={close}
  handleSubmit={submit}
  fileProcessor={parseFile}
  renderCustomPreview={(items) => <ProductsPreviewTable items={items ?? []} />}
/>;
```

`useImportDialog` also accepts and forwards `renderCustomPreview`:

```tsx
import { useImportDialog } from "@sito/dashboard-app";

const importDialog = useImportDialog<ProductDto, ProductImportPreviewDto>({
  queryKey: ["products"],
  entity: "products",
  mutationFn: api.products.import,
  fileProcessor: parseFile,
  renderCustomPreview: (items) => <ProductsPreviewTable items={items ?? []} />,
});
```

### ImportDialog extra fields

`ImportDialog` supports an optional `extraFields: ReactNode` slot rendered
between the preview and `DialogActions`. Use it for custom inputs (checkboxes,
selects, notes) that complement the import payload.

```tsx
import { ImportDialog } from "@sito/dashboard-app";

<ImportDialog<TransactionImportPreviewDto>
  open={open}
  title="Import transactions"
  handleClose={close}
  handleSubmit={submit}
  fileProcessor={parseFile}
  extraFields={
    <label>
      <input
        type="checkbox"
        checked={useCurrentAccount}
        onChange={(e) => setUseCurrentAccount(e.target.checked)}
      />
      Use current account
    </label>
  }
/>;
```

`useImportDialog` exposes a hook-managed flow through an optional `TExtra`
generic plus two new props:

- `defaultExtra?: TExtra` — initial value for the extra fields (also used to
  reset on close/submit).
- `renderExtraFields?: ({ values, setValue, setValues }) => ReactNode` — render
  prop whose returned node is wired into `ImportDialog` via the `extraFields`
  slot when spreading the hook result.

The hook merges the extra values into the mutation payload as
`{ items, override, ...extra }`. `mutationFn` is typed as
`ImportDto<TPreview> & TExtra`.

```tsx
import { ImportDialog, useImportDialog } from "@sito/dashboard-app";

type ExtraImport = { useCurrentAccount: boolean };

const importDialog = useImportDialog<
  TransactionDto,
  TransactionImportPreviewDto,
  ExtraImport
>({
  queryKey: ["transactions"],
  entity: "transactions",
  fileProcessor: parseFile,
  defaultExtra: { useCurrentAccount: true },
  mutationFn: ({ items, override, useCurrentAccount }) =>
    api.transactions.import({
      items,
      override,
      accountId: useCurrentAccount ? currentAccountId : null,
    }),
  renderExtraFields: ({ values, setValue }) => (
    <label>
      <input
        type="checkbox"
        checked={values.useCurrentAccount}
        onChange={(e) => setValue("useCurrentAccount", e.target.checked)}
      />
      Use current account
    </label>
  ),
});

<ImportDialog<TransactionImportPreviewDto> {...importDialog} />;
```

### ExportDialog / useExportDialog (optional export config)

Export flows are direct by default through `useExportAction` +
`useExportActionMutate`. For entities that need configuration before export
(date range, format, columns), use `useExportDialog` + `ExportDialog`. Both
hooks return an `action()` with the same `ActionType` shape, so the call site
stays the same.

```tsx
import { ExportDialog, useExportDialog } from "@sito/dashboard-app";

type ExportExtra = { from: string; to: string; format: "csv" | "xlsx" };

const exportDialog = useExportDialog<TransactionDto, ExportExtra, Blob>({
  entity: "transactions",
  defaultExtra: { from: "", to: "", format: "csv" },
  mutationFn: ({ from, to, format }) =>
    api.transactions.exportRange({ from, to, format }),
  renderExtraFields: ({ values, setValue }) => (
    <div className="grid gap-2">
      <input
        type="date"
        value={values.from}
        onChange={(e) => setValue("from", e.target.value)}
      />
      <input
        type="date"
        value={values.to}
        onChange={(e) => setValue("to", e.target.value)}
      />
      <select
        value={values.format}
        onChange={(e) =>
          setValue("format", e.target.value as ExportExtra["format"])
        }
      >
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
    </div>
  ),
});

<Page<TransactionDto> title="Transactions" actions={[exportDialog.action()]} />;
<ExportDialog {...exportDialog} title="Export transactions" />;
```

Notes:

- `useExportDialog` does not invalidate any query and does not auto-trigger
  downloads — handle those in `onSuccess` or inside `mutationFn`.
- For entities that don't need a dialog, stay on `useExportAction` +
  `useExportActionMutate`. The `action()` descriptor is interchangeable.

### Dialog extra actions

`ConfirmationDialog`, `FormDialog`, and `ImportDialog` support optional `extraActions`.
Use this when you need secondary actions in the dialog footer (for example, "Save draft", "Help", or "Download template").

```tsx
import { ConfirmationDialog, type ButtonPropsType } from "@sito/dashboard-app";

const extraActions: ButtonPropsType[] = [
  {
    id: "help-action",
    type: "button",
    variant: "outlined",
    color: "secondary",
    children: "Help",
    onClick: () => openHelpPanel(),
  },
];

<ConfirmationDialog
  open={open}
  title="Confirm delete"
  handleClose={close}
  handleSubmit={confirm}
  extraActions={extraActions}
/>;
```

For `FormDialog`, set `type: "button"` on extra actions unless you explicitly want submit behavior.

### Dialog mobile full screen

`Dialog`, `ConfirmationDialog`, `FormDialog`, and `ImportDialog` support `mobileFullScreen?: boolean`.
Default is `false`. Set it to `true` to force full-screen layout on very small screens.

```tsx
import { FormDialog } from "@sito/dashboard-app";

<FormDialog<ProductForm>
  open={open}
  title="Edit product"
  handleClose={close}
  handleSubmit={handleSubmit}
  onSubmit={onSubmit}
  mobileFullScreen
>
  {/* form fields */}
</FormDialog>;
```

### PrettyGrid infinite scroll

`PrettyGrid` supports optional infinite loading with `IntersectionObserver`.
Current usage without infinite props keeps the same behavior.

```tsx
import { PrettyGrid, Loading } from "@sito/dashboard-app";

<PrettyGrid<ProductDto>
  data={products}
  loading={isLoading}
  renderComponent={(item) => <ProductCard item={item} />}
  hasMore={hasMore}
  loadingMore={isFetchingNextPage}
  onLoadMore={fetchNextPage}
  loadMoreComponent={<Loading className="!w-auto" loaderClass="w-5 h-5" />}
/>;
```

Defaults:

- `hasMore = false`
- `loadingMore = false`
- `loadMoreComponent = null`
- `observerRootMargin = "0px 0px 200px 0px"`
- `observerThreshold = 0`

### ToTop customization

`ToTop` is now customizable while preserving current defaults.

```tsx
import { ToTop } from "@sito/dashboard-app";

<ToTop
  threshold={120}
  tooltip="Back to top"
  variant="outlined"
  color="secondary"
  className="right-8 bottom-8"
  scrollTop={0}
  scrollLeft={0}
/>;
```

Main optional props:

- `threshold?: number` (default `200`)
- `scrollTop?: number` / `scrollLeft?: number` (default `0` / `0`)
- `icon?: IconDefinition`
- `tooltip?: string`
- `scrollOnClick?: boolean` (default `true`)
- `onClick?: () => void`

### TopBanner (generic)

`TopBanner` is a presentational, full-width banner used as the base for any global notice. `OfflineBanner` is a thin wrapper around it. Its `color` prop matches the `Button` color contract, plus the extended `tertiary` and `quaternary` palette tokens defined in `src/index.css`.

```tsx
import { TopBanner } from "@sito/dashboard-app";

<TopBanner color="warning">Scheduled maintenance at 22:00 UTC</TopBanner>;
```

Props:

- `visible?: boolean` (default `true`) — renders nothing when `false`.
- `children: ReactNode` — banner content.
- `color?: "default" | "primary" | "secondary" | "tertiary" | "quaternary" | "info" | "success" | "warning" | "error"` (default `"default"`).
- `role?: string` (default `"status"`) and `ariaLive?: "off" | "polite" | "assertive"` (default `"polite"`).
- `className?: string` — merged with `top-banner` + `top-banner--{color}`.

Prefer `TopBanner` for ad-hoc app-wide notices; reach for `OfflineBanner` for the connectivity-specific case.

### Offline status helpers

Use `useOnlineStatus` for connectivity state and `OfflineBanner` for a reusable offline UI hint. `OfflineBanner` is a predefined preset of `TopBanner` — its color is fixed to `warning` and is not exposed as a prop. Props are limited to `isOnline?`, `message?`, and `className?`. For banners with different colors, use `TopBanner` directly.

```tsx
import { OfflineBanner, useOnlineStatus } from "@sito/dashboard-app";

function AppShell() {
  const { isOnline } = useOnlineStatus({
    checkIntervalMs: 30000,
    probeUrl: "/health",
    timeoutMs: 5000,
  });

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      {/* routes */}
    </>
  );
}
```

Menu helpers for feature-flag filtering and divider cleanup:

```ts
import {
  filterMenuByFeatureFlags,
  normalizeMenuDividers,
} from "@sito/dashboard-app";

const filtered = filterMenuByFeatureFlags(menuMap, isFeatureEnabled, {
  reports: "reportsFeature",
});

const normalized = normalizeMenuDividers(filtered);
```

Advanced online-status API for sync/offline orchestration:

- `useOnlineStatusSnapshot(options?)` returns `{ isBrowserOnline, isServerReachable, isOnline, isChecking, lastCheckedAt }`
- `probeServerReachability(options?)` triggers a probe and updates the shared snapshot
- `setServerReachable(value)` manually overrides server reachability in the snapshot
- `configureOnlineStatus(options?)` sets probe runtime defaults (`interval`, `url`, timeout, method, headers/resolver)

`configureOnlineStatus` replaces the previous runtime config on each call (no cross-use config carry-over).

### BottomNavigation

`BottomNavigation` is a mobile-first fixed navigation bar intended for compact app shells.
It is router-agnostic and uses `ConfigProvider` primitives (`location`, `navigate`, `linkComponent`).

```tsx
import {
  BottomNavigation,
  type BottomNavigationItemType,
} from "@sito/dashboard-app";
import {
  faBox,
  faHome,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type BottomNavId = "home" | "products" | "profile";

const bottomItems: BottomNavigationItemType<BottomNavId>[] = [
  { id: "home", label: "Home", to: "/", icon: faHome, position: "left" },
  {
    id: "products",
    label: "Products",
    to: "/products",
    icon: faBox,
    position: "left",
  },
  {
    id: "profile",
    label: "Profile",
    to: "/profile",
    icon: faUser,
    position: "right",
  },
];

<BottomNavigation
  items={bottomItems}
  centerAction={{
    icon: faPlus,
    to: "/products/new",
    ariaLabel: "Create product",
  }}
/>;
```

Dynamic center action with provider (optional):

```tsx
import {
  BottomNavActionProvider,
  BottomNavigation,
  useRegisterBottomNavAction,
  type BottomNavigationItemType,
} from "@sito/dashboard-app";
import { faTags } from "@fortawesome/free-solid-svg-icons";

function ProductsCenterAction() {
  useRegisterBottomNavAction({
    icon: faTags,
    ariaLabel: "Create category",
    to: "/categories/new",
    color: "secondary",
  });
  return null;
}

<BottomNavActionProvider>
  <ProductsCenterAction />
  <BottomNavigation
    items={bottomItems}
    centerAction={{ to: "/products/new" }}
  />
</BottomNavActionProvider>;
```

Key notes:

- Use `position: "right"` to place items in the right group; omitted/`"left"` stays on the left group.
- Use `isItemActive={(pathname, item) => ...}` for custom active matching (default uses path-prefix matching, with exact match for `/`).
- Use `hidden`/`disabled` on each item and `centerAction.hidden` for conditional rendering.
- `centerAction` supports `IconButton` visual props and optional `to`; navigation runs after `onClick` unless `event.preventDefault()` is called.
- `BottomNavActionProvider` is optional. When mounted, `useRegisterBottomNavAction` can override center-action fields dynamically from active page scope; registered fields take precedence over static `centerAction` props.

### AppShell, AuthShell, DashboardHeader, DashboardFooter (layout shells)

These layout shells consolidate the header/footer/auth wrapper patterns previously duplicated across consumer apps.

`AppShell` is the authenticated layout shell. It mounts header/content/footer/bottom-nav slots plus the global `Notification` portal. Wrap your route content with `AppShell` after the standard providers (`ConfigProvider`/`NavbarProvider`/`BottomNavActionProvider`, e.g. via `AppProviders`):

```tsx
import {
  AppShell,
  DashboardHeader,
  DashboardFooter,
  BottomNavigation,
} from "@sito/dashboard-app";

<AppShell
  header={<DashboardHeader menuMap={menuMap} showOfflineBanner />}
  footer={<DashboardFooter copyrightText="© Acme" bottomNavSpacing />}
  bottomNavigation={
    <BottomNavigation items={bottomItems} centerAction={centerAction} />
  }
  extras={<Tooltip id="tooltip" />}
>
  <Outlet />
</AppShell>;
```

Props (`AppShell`):

- `header?`, `footer?`, `bottomNavigation?`, `extras?` (slot for `Tooltip`/`Onboarding`/`PwaUpdateDialog`).
- `withNotification?: boolean` (default `true`) — toggles the built-in `Notification` portal.
- `className?` — merged onto the `app-shell` wrapper.
- Slot order: `header → children → footer → bottomNavigation → extras → Notification`.

`AuthShell` is the wrapper for auth routes. It renders `children` (typically `<Outlet />`) plus the global `Notification` portal:

```tsx
<AuthShell>
  <Outlet />
</AuthShell>
```

Props (`AuthShell`): `children`, `withNotification?` (default `true`), `className?`. Authenticated-redirect logic and error boundary stay in the consumer where route constants are known.

`DashboardHeader` combines `Drawer` + `Navbar` (+ optional `OfflineBanner`) and owns the drawer open/close state internally. Generic over `MenuKeys`:

```tsx
<DashboardHeader<"home" | "settings">
  menuMap={menuMap}
  logo={<Logo />}
  showOfflineBanner
  navbarProps={{ showSearch: true }}
/>
```

Props: `menuMap` (required), `logo?`, `showOfflineBanner?` (default `false`), `navbarProps?` (everything except `openDrawer`, which is wired internally).

`DashboardFooter` renders copyright + optional `ToTop`:

```tsx
<DashboardFooter
  copyrightText="© Acme"
  year={2026}
  bottomNavSpacing
  toTopProps={{ tooltip: "Back to top" }}
/>
```

Props: `copyrightText` (required), `year?` (default current year), `showToTop?` (default `true`), `toTopProps?`, `bottomNavSpacing?` (adds `mb-16 sm:mb-0` when mounting `BottomNavigation`), `children?` (full custom content), `className?`, `textClassName?`.

### NotFoundView and FeatureUnavailableView

Reusable fallback views for 404 / disabled-feature screens. Both use `linkComponent` from `ConfigProvider` for the CTA, so navigation stays router-agnostic. Consumer provides text and CTA target (route constant from `lib/routes.ts`).

```tsx
import { NotFoundView, FeatureUnavailableView } from "@sito/dashboard-app";
import { faLock } from "@fortawesome/free-solid-svg-icons";

<NotFoundView
  title={t("_pages:notFound.title")}
  body={t("_pages:notFound.body")}
  ctaLabel={t("_pages:home.title")}
  ctaTo={AppRoutes.Home}
/>;

<FeatureUnavailableView
  title={t("_pages:featureFlags.route.title")}
  body={t("_pages:featureFlags.route.body", { module: t(moduleKey) })}
  ctaLabel={t("_pages:featureFlags.route.cta")}
  ctaTo={AppRoutes.Home}
  icon={faLock}
/>;
```

Both accept className overrides (`className`, `titleClassName`, `bodyClassName`, `ctaClassName`); `FeatureUnavailableView` also accepts `iconClassName` and a custom `icon: IconDefinition` (default `faWarning`).

### PwaUpdateDialog

Presentational dialog for "new version available, reload to apply." The source of `needRefresh` and the update callback stays in the consumer (custom service-worker hook, `vite-plugin-pwa`, etc.) — the library does not import `navigator.serviceWorker` or `virtual:pwa-register/react`.

```tsx
import { PwaUpdateDialog } from "@sito/dashboard-app";

<PwaUpdateDialog
  open={needRefresh}
  onDismiss={dismissUpdate}
  onUpdate={applyUpdate}
  title={t("_pages:pwaUpdate.title")}
  description={t("_pages:pwaUpdate.description")}
  dismissLabel={t("_pages:pwaUpdate.actions.later")}
  updateLabel={t("_pages:pwaUpdate.actions.update")}
/>;
```

Props: `open`, `onDismiss`, `onUpdate`, `title`, `description`, `dismissLabel`, `updateLabel`, optional `mobileFullScreen` and `containerClassName` (default `"!items-end pb-3"`).

### Onboarding step animations (`remountStepOnChange`)

`Onboarding` ships with built-in step entry animations (`onboarding-step-rise-in` + `onboarding-step-pop-in`, with stagger on title/body/content/actions). By default the same `<Step>` tree is reconciled across steps, so the animation only runs on first mount. Opt into `remountStepOnChange={true}` to force a remount of the active step on every transition:

```tsx
<Onboarding remountStepOnChange steps={steps} />
```

Animation gating follows `ConfigProvider.motion`: disabled when `:root[data-sito-motion="none"]` and under `prefers-reduced-motion: reduce` unless `:root[data-sito-motion="always"]` overrides.

## Dialog hook migration (`v0.0.54`)

`v0.0.54` removes the legacy entity-coupled `useFormDialog` contract.

### Breaking changes

- `useFormDialog` is now core lifecycle only (`mode: "state" | "entity"`).
- Legacy props were removed from `useFormDialog`: `mutationFn`, `queryKey`, `getFunction`, `dtoToForm`, `formToDto`.
- Deprecated aliases were removed:
  - `useFormDialogLegacy`
  - `useEntityFormDialog`

### What to use now

- Local/state-only dialog (filters/settings): `useFormDialog`
- Create flow (POST): `usePostDialog`
- Edit flow (PUT + get by id): `usePutDialog`

### Before -> After

```tsx
// BEFORE (no longer supported in v0.0.54+)
const createDialog = useFormDialog<
  ProductDto,
  CreateProductDto,
  ProductDto,
  ProductForm
>({
  title: "Create product",
  defaultValues: { name: "", price: 0 },
  mutationFn: (dto) => api.products.insert(dto),
  formToDto: (form) => ({ name: form.name, price: form.price }),
  queryKey: ["products"],
});

// AFTER
const createDialog = usePostDialog<CreateProductDto, ProductDto, ProductForm>({
  title: "Create product",
  defaultValues: { name: "", price: 0 },
  mutationFn: (dto) => api.products.insert(dto),
  formToDto: (form) => ({ name: form.name, price: form.price }),
  queryKey: ["products"],
});
```

```tsx
// BEFORE (no longer supported in v0.0.54+)
const editDialog = useFormDialog<
  ProductDto,
  UpdateProductDto,
  ProductDto,
  ProductForm
>({
  title: "Edit product",
  defaultValues: { name: "", price: 0 },
  getFunction: (id) => api.products.getById(id),
  dtoToForm: (dto) => ({ name: dto.name, price: dto.price }),
  mutationFn: (dto) => api.products.update(dto),
  formToDto: (form) => ({ id: 0, ...form }),
  queryKey: ["products"],
});

// AFTER
const editDialog = usePutDialog<
  ProductDto,
  UpdateProductDto,
  ProductDto,
  ProductForm
>({
  title: "Edit product",
  defaultValues: { name: "", price: 0 },
  getFunction: (id) => api.products.getById(id),
  dtoToForm: (dto) => ({ name: dto.name, price: dto.price }),
  mutationFn: (dto) => api.products.update(dto),
  formToDto: (form, dto) => ({ id: dto?.id ?? 0, ...form }),
  queryKey: ["products"],
});
```

### Core `useFormDialog` error handling

`useFormDialog` supports a core `onError` callback for failures in submit/apply/clear paths.

```tsx
const filtersDialog = useFormDialog<ProductFilters>({
  mode: "state",
  title: "Filters",
  defaultValues: { search: "", minPrice: 0 },
  onSubmit: async (values) => setTableFilters(values),
  onError: (error, { phase, values }) => {
    console.error("Dialog error", { error, phase, values });
  },
});
```

### Opening `useFormDialog` with values

`openDialog` now supports these signatures:

- `openDialog()`
- `openDialog(id: number)`
- `openDialog({ id?: number, values?: DefaultValues<TFormType> })`

Use `values` when you want to hydrate the form at open-time, for example re-opening with the last submitted filters:

```tsx
const [lastSubmittedFilters, setLastSubmittedFilters] =
  useState<ProductFilters>({
    search: "",
    minPrice: 0,
  });

const filtersDialog = useFormDialog<ProductFilters>({
  mode: "state",
  title: "Filters",
  defaultValues: { search: "", minPrice: 0 },
  onSubmit: (values) => {
    setLastSubmittedFilters(values);
    setTableFilters(values);
  },
});

const reopenWithLastSubmitted = () => {
  filtersDialog.openDialog({ values: lastSubmittedFilters });
};
```

If both `openDialog({ values })` and `reinitializeOnOpen`/`dtoToForm` are configured, explicit `values` passed to `openDialog` take priority for that opening.

Storybook reference: `Hooks/Dialogs/FormDialogs` includes `StateModeSetValuesOnOpen` and `StateModeReopenWithSubmittedValues` scenarios.

## Initial setup example

Wrap your app with providers in this order to enable routing integration, React Query, auth, notifications, and drawer/navbar state.
`ManagerProvider` mounts `QueryClientProvider` internally and creates an isolated default `QueryClient` per provider instance.
If you need custom React Query defaults or want to share a client intentionally, pass your own client with `queryClient={queryClient}`.

```tsx
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AuthProvider,
  BottomNavActionProvider,
  ConfigProvider,
  DrawerMenuProvider,
  IManager,
  ManagerProvider,
  NavbarProvider,
  NotificationProvider,
} from "@sito/dashboard-app";

const authStorageKeys = {
  user: "user",
  remember: "remember",
  refreshTokenKey: "refreshToken",
  accessTokenExpiresAtKey: "accessTokenExpiresAt",
};

const manager = new IManager(
  import.meta.env.VITE_API_URL,
  authStorageKeys.user,
  {
    rememberKey: authStorageKeys.remember,
    refreshTokenKey: authStorageKeys.refreshTokenKey,
    accessTokenExpiresAtKey: authStorageKeys.accessTokenExpiresAtKey,
  },
);

function AppProviders({ children }: { children: ReactNode }) {
  const go = useNavigate();
  const location = useLocation();

  return (
    <ConfigProvider
      location={location}
      navigate={(route) => {
        if (typeof route === "number") go(route);
        else go(route);
      }}
      linkComponent={Link}
      motion="auto"
    >
      <ManagerProvider manager={manager}>
        <AuthProvider
          user={authStorageKeys.user}
          remember={authStorageKeys.remember}
          refreshTokenKey={authStorageKeys.refreshTokenKey}
          accessTokenExpiresAtKey={authStorageKeys.accessTokenExpiresAtKey}
        >
          <NotificationProvider>
            <DrawerMenuProvider>
              <NavbarProvider>
                {/* Optional: only when pages register dynamic BottomNavigation center actions */}
                <BottomNavActionProvider>{children}</BottomNavActionProvider>
              </NavbarProvider>
            </DrawerMenuProvider>
          </NotificationProvider>
        </AuthProvider>
      </ManagerProvider>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>{/* Your app routes/pages */}</AppProviders>
    </BrowserRouter>
  );
}
```

Notes:

- Keep `ManagerProvider` above `AuthProvider`.
- `Drawer` and `Onboarding` are auth-optional wrappers. Without `AuthProvider`, `Drawer` treats the session as logged-out and `Onboarding` skips `setGuestMode`.
- `NavbarProvider` is required when using `Navbar` or `useNavbar`; otherwise it can be omitted.
- `BottomNavActionProvider` is optional; mount it around your app shell when pages/components use `useRegisterBottomNavAction`.
- If you customize auth storage keys in `AuthProvider`, pass the same keys to `IManager`/`BaseClient` auth config.
- `ConfigProvider` accepts `motion="auto" | "none" | "always"` to control library transitions globally; `auto` is the default and respects `prefers-reduced-motion`.

### Provider composer (`AppProviders` / `createAppProviders`)

To avoid repeating provider wiring across apps, use the built-in composer.

`AppProviders` keeps the base order:
`ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider`

It also supports:

- `auth={false}` to disable auth wiring.
- `withNavbarProvider` and `withBottomNavActionProvider` for optional UI providers.
- `featureFlagsProvider`, `offlineSyncProvider`, and `appWrapperProvider` slots for app-specific wrappers.
- `config.motion` to control library transitions globally: `"auto"` (default), `"none"`, or `"always"`.

```tsx
import type { ReactNode } from "react";
import {
  AppProviders,
  IManager,
  type BasicProviderPropTypes,
} from "@sito/dashboard-app";
import { Link, useLocation, useNavigate } from "react-router-dom";

const manager = new IManager(import.meta.env.VITE_API_URL, "user");

const FeatureFlagsProvider = ({ children }: BasicProviderPropTypes) => (
  <>{children}</>
);

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppProviders
      config={{
        location,
        navigate: (route) => {
          if (typeof route === "number") navigate(route);
          else navigate(route);
        },
        linkComponent: Link,
        motion: "auto",
      }}
      manager={{ manager }}
      auth={{ user: "user", remember: "remember" }}
      withNavbarProvider
      withBottomNavActionProvider
      featureFlagsProvider={{ provider: FeatureFlagsProvider }}
    >
      {children}
    </AppProviders>
  );
}
```

`createAppProviders(config)` returns a preconfigured component for cases where config is static:

```tsx
import { createAppProviders, IManager } from "@sito/dashboard-app";
import { Link } from "react-router-dom";

const manager = new IManager(import.meta.env.VITE_API_URL, "user");

export const Providers = createAppProviders({
  config: {
    location: window.location,
    navigate: () => {},
    linkComponent: Link,
    motion: "auto",
  },
  manager: { manager },
  auth: false,
});
```

## Supabase setup (optional backend)

The library does not read `.env` values directly. The consumer app must create the Supabase client and pass it to `SupabaseManagerProvider`.

Use frontend-safe keys only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not expose service-role keys in the browser.

```tsx
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import {
  BottomNavActionProvider,
  ConfigProvider,
  SupabaseManagerProvider,
  SupabaseAuthProvider,
  NotificationProvider,
  DrawerMenuProvider,
  NavbarProvider,
} from "@sito/dashboard-app";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      location={window.location}
      navigate={() => {}}
      linkComponent={Link}
      motion="auto"
    >
      <SupabaseManagerProvider supabase={supabase}>
        <SupabaseAuthProvider>
          <NotificationProvider>
            <DrawerMenuProvider>
              <NavbarProvider>
                {/* Optional: only when pages register dynamic BottomNavigation center actions */}
                <BottomNavActionProvider>{children}</BottomNavActionProvider>
              </NavbarProvider>
            </DrawerMenuProvider>
          </NotificationProvider>
        </SupabaseAuthProvider>
      </SupabaseManagerProvider>
    </ConfigProvider>
  );
}
```

`useAuth` keeps the same contract with `SupabaseAuthProvider` (`account`, `logUser`, `logoutUser`, `logUserFromLocal`, `isInGuestMode`, `setGuestMode`).

`SupabaseDataClient` follows the same generic surface as `BaseClient` and `IndexedDBClient`, so entity clients can switch backend with minimal UI/hook changes.
It also supports optional configuration for conventional columns: `idColumn` (default `"id"`), `deletedAtColumn` (default `"deletedAt"`), and `defaultSortColumn`.

### Supabase entity client example

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportPreviewDto,
  SupabaseDataClient,
} from "@sito/dashboard-app";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
  categoryId?: number;
}

interface ProductCommonDto extends BaseCommonEntityDto {
  name: string;
}

interface CreateProductDto {
  name: string;
  price: number;
  categoryId?: number;
}

interface UpdateProductDto extends DeleteDto {
  name?: string;
  price?: number;
  categoryId?: number;
}

interface ProductFilterDto extends BaseFilterDto {
  categoryId?: number;
}

interface ProductImportPreviewDto extends ImportPreviewDto {
  id: number;
  name: string;
  price: number;
}

class ProductsSupabaseClient extends SupabaseDataClient<
  "products",
  ProductDto,
  ProductCommonDto,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  ProductImportPreviewDto
> {
  constructor(supabase: SupabaseClient) {
    super("products", supabase, {
      defaultSortColumn: "id",
    });
  }
}

const productsClient = new ProductsSupabaseClient(supabase);
```

### Compatibility and incremental migration

- The REST flow stays intact: existing apps using `ManagerProvider` + `AuthProvider` + `BaseClient` do not need changes.
- You can migrate entity by entity: move one resource client at a time from `BaseClient` to `SupabaseDataClient`.
- During migration, mixed data backends are valid (`BaseClient` for some entities, `SupabaseDataClient` for others) as long as each UI flow uses the corresponding client methods.
- If you switch auth to Supabase, use `SupabaseManagerProvider` + `SupabaseAuthProvider`; if you keep REST auth, continue with `ManagerProvider` + `AuthProvider`.

## Built-in auth refresh behavior

`APIClient` and `BaseClient` already include refresh/retry behavior for secured requests:

- If `accessTokenExpiresAt` is close to expiry, a refresh runs before sending the request.
- If a secured request returns `401`, the client attempts one refresh and retries once.
- Concurrent refresh calls are deduplicated with a shared in-flight promise.
- If refresh fails, local session keys are cleared (`user`, `remember`, `refreshToken`, `accessTokenExpiresAt`).

## Local development (step-by-step)

1. Clone the repository:
   ```bash
   git clone https://github.com/sito8943/-sito-dashboard-app.git
   cd ./-sito-dashboard-app
   ```
2. Use the project Node version:
   ```bash
   nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. (Optional) Run Storybook:
   ```bash
   npm run storybook
   ```

## Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: compile TypeScript and build the library
- `npm run preview`: preview the Vite build locally
- `npm run lint`: run ESLint + Prettier check + depcheck (no file writes)
- `npm run lint:fix`: run ESLint autofix + Prettier write mode
- `npm run docs:check`: validate docs policy markers, relative links, and docs consistency rules
- `npm run test`: run unit/component tests once (Vitest)
- `npm run test:watch`: run tests in watch mode
- `npm run format`: run Prettier write mode
- `npm run storybook`: run Storybook locally
- `npm run build-storybook`: generate static Storybook build

## Offline-first / IndexedDB fallback

`IndexedDBClient` is a drop-in offline alternative to `BaseClient`. It exposes the same method surface (`insert`, `insertMany`, `update`, `get`, `getById`, `export`, `import`, `commonGet`, `softDelete`, `restore`) but stores data locally in the browser's IndexedDB instead of calling a remote API.

### When to use it

Use `IndexedDBClient` when the remote API is unreachable — for example in offline-capable dashboards, field apps, or PWAs. The pattern is to detect connectivity and swap the client transparently:

```ts
import { BaseClient, IndexedDBClient } from "@sito/dashboard-app";

// Online: hit the API. Offline: read/write from IndexedDB.
const productsClient = navigator.onLine
  ? new ProductsClient(import.meta.env.VITE_API_URL)
  : new ProductsIndexedDBClient();
```

### Creating an offline client

Extend `IndexedDBClient` the same way you would extend `BaseClient`:

```ts
import {
  IndexedDBClient,
  BaseEntityDto,
  BaseCommonEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportPreviewDto,
} from "@sito/dashboard-app";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

interface ProductFilterDto extends BaseFilterDto {
  category?: string;
}

class ProductsIndexedDBClient extends IndexedDBClient<
  "products",
  ProductDto,
  ProductDto, // TCommonDto
  Omit<ProductDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ProductDto, // TUpdateDto (extends DeleteDto via BaseEntityDto)
  ProductFilterDto,
  ImportPreviewDto
> {
  constructor() {
    super("products", "my-app-db");
  }
}
```

### Reacting to connectivity changes at runtime

```ts
import { useState, useEffect } from "react";

function useProductsClient() {
  const [client, setClient] = useState(() =>
    navigator.onLine
      ? new ProductsClient(apiUrl)
      : new ProductsIndexedDBClient(),
  );

  useEffect(() => {
    const goOnline = () => setClient(new ProductsClient(apiUrl));
    const goOffline = () => setClient(new ProductsIndexedDBClient());
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return client;
}
```

> **Note:** `IndexedDBClient` requires a browser environment. It will not work in SSR/Node contexts.

Contract and filtering notes:

- Preferred update contract is `update(value)` (aligned with `BaseClient.update(value)`).
- Legacy `update(id, value)` remains temporarily supported for backward compatibility.
- Filtering uses strict equality for regular keys.
- `deletedAt` remains a date filter (`Date | null`) for exact-match filtering.
- Use `softDeleteScope` for trash filters:
  - `softDeleteScope: "ACTIVE"` => active rows (`deletedAt` null/undefined)
  - `softDeleteScope: "DELETED"` => deleted rows (`deletedAt` not null/undefined)
  - `softDeleteScope: "ALL"` => all rows

### Sharing a database across multiple entity clients

Multiple `IndexedDBClient` instances can share the same `dbName` to co-locate related stores (e.g. `users`, `accounts`, `transactions`) in a single database. Each client registers its `table` internally, so opening one store no longer drops stores registered by other clients.

```ts
class UsersIndexedDBClient extends IndexedDBClient<"users" /* ... */> {
  constructor() {
    super("users", "my-app-db");
  }
}

class AccountsIndexedDBClient extends IndexedDBClient<"accounts" /* ... */> {
  constructor() {
    super("accounts", "my-app-db");
  }
}

// Concurrent opens are serialized per `dbName` and share one upgrade pass.
const users = new UsersIndexedDBClient();
const accounts = new AccountsIndexedDBClient();
```

Notes:

- Pass the same `dbName` to every client that belongs to the same logical database.
- `version` is the minimum schema version for that client; the actual open runs at `max(registered versions, current db version)` and bumps automatically when a registered store is missing.
- Opens are serialized per `dbName` via an internal lock, so parallel `Promise.all([...])` calls across clients are safe.

## Tests

Automated tests are configured with `Vitest` + `@testing-library/react`.

Run all tests once:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Current validation stack:

- `npm run lint`
- `npm run docs:check`
- `npm run test`
- `npm run build`
- Storybook/manual behavior checks (optional visual validation)

## Linting and formatting

Run linters:

```bash
npm run lint
```

Run automatic fixes:

```bash
npm run lint:fix
```

Run formatting:

```bash
npm run format
```

## Deployment / release

CI is available through GitHub Actions:

- `.github/workflows/ci.yml`: runs `test + build` on `push` and `pull_request`
- `.github/workflows/lint.yml`: runs `lint + docs:check` on `pull_request`

Package release/publish is still handled manually.

Recommended release flow:

1. Ensure your branch is up to date and the working tree is clean.
2. Update version:
   ```bash
   npm version patch
   # or: npm version minor / npm version major
   ```
3. Validate package:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
4. Publish to npm:
   ```bash
   npm publish --access public
   ```
5. Push commit and tag:
   ```bash
   git push --follow-tags
   ```

## Contributing

1. Fork the repository.
2. Create a branch for your feature/fix.
3. Open a PR with a clear change summary and validation notes.

## License

MIT (see `LICENSE`).
