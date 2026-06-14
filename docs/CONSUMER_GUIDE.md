# Consumer Guide for `@sito/dashboard-app`

Guide intended for projects that consume the library, focused on providers, components, props, and usage patterns.

## 1. Installation

```bash
npm install @sito/dashboard-app
```

Install peer dependencies in the consumer project as well:

```bash
npm install \
  react@18.3.1 react-dom@18.3.1 \
  @sito/dashboard@^0.0.85 \
  @tanstack/react-query@5.83.0 \
  react-hook-form@7.61.1 \
  @fortawesome/fontawesome-svg-core@7.0.0 \
  @fortawesome/free-solid-svg-icons@7.0.0 \
  @fortawesome/free-regular-svg-icons@7.0.0 \
  @fortawesome/free-brands-svg-icons@7.0.0 \
  @fortawesome/react-fontawesome@0.2.3
```

If you use Supabase backend, also install:

```bash
npm install @supabase/supabase-js@2.100.0
```

## Runtime scope (important)

`@sito/dashboard-app` is **client-side only**. This package is not designed for SSR/server rendering pipelines.
Use it in browser-rendered applications.

## 2. Required Providers

Recommended order:

1. `ConfigProvider`
2. `ManagerProvider`
3. `AuthProvider`
4. `NotificationProvider`
5. `DrawerMenuProvider`
6. `NavbarProvider` (if you use dynamic navbar state)
7. `BottomNavActionProvider` (optional; when you use dynamic mobile center actions)

`ManagerProvider` already mounts an internal `QueryClientProvider`.
By default, each `ManagerProvider` instance creates its own isolated `QueryClient`.
If you need custom React Query defaults, or you intentionally want multiple trees to share cache state, pass your own client with `queryClient={queryClient}`.

If you prefer a pre-wired composer, use `AppProviders` or `createAppProviders` and keep the same base order.

```tsx
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

export function AppProviders({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ConfigProvider
      location={location}
      navigate={(route) => {
        if (typeof route === "number") navigate(route);
        else navigate(route);
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
                {/* Optional: only if your pages register dynamic BottomNavigation center actions */}
                <BottomNavActionProvider>{children}</BottomNavActionProvider>
              </NavbarProvider>
            </DrawerMenuProvider>
          </NotificationProvider>
        </AuthProvider>
      </ManagerProvider>
    </ConfigProvider>
  );
}
```

### 2.0.1 Provider composer

`AppProviders` composes this base tree:
`ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider`

Optional capabilities:

1. Disable auth: `auth={false}`
2. Enable optional UI providers: `withNavbarProvider`, `withBottomNavActionProvider`
3. Inject app-specific wrappers: `featureFlagsProvider`, `offlineSyncProvider`, `appWrapperProvider`
4. Control library transitions globally with `config.motion`: `"auto"` (default), `"none"`, or `"always"`

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

function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

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
      withNavbarProvider
      featureFlagsProvider={{ provider: FeatureFlagsProvider }}
    >
      {children}
    </AppProviders>
  );
}
```

`motion` semantics:

- `"auto"` respects `prefers-reduced-motion`.
- `"none"` disables library transitions and animations.
- `"always"` keeps library transitions enabled even when the OS/browser requests reduced motion.

### 2.0.2 Provider and navigation helper types

These reusable types are also part of the public surface and should be
imported from `@sito/dashboard-app` instead of copied into consumer apps.

| Type                                                                        | Use                                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `BasicProviderPropTypes`                                                    | Minimal `{ children }` contract for app-owned wrapper providers                       |
| `AppProviderSlot<Props>` / `AnyAppProviderSlot`                             | Type app-specific provider slots passed into `AppProviders` / `createAppProviders`    |
| `AppProvidersProps`                                                         | Full prop contract for custom wrappers around `AppProviders`                          |
| `MotionPreference`                                                          | Shared `"auto" \| "always" \| "none"` motion union used by `ConfigProvider`           |
| `Path` / `Location<State>`                                                  | Router-agnostic location shape consumed by `ConfigProvider` and auth helpers          |
| `BaseLinkPropsType` / `BaseSearchModalPropsType`                            | Contracts for custom `linkComponent` and `searchComponent` passed to `ConfigProvider` |
| `MenuItemType<MenuKeys>` / `SubMenuItemType`                                | Drawer/menu metadata contracts                                                        |
| `ViewPageType<PageId>` / `NamedViewPageType<PageId>`                        | Typed sitemap/route metadata contracts                                                |
| `AccessGuard`                                                               | Shared access predicate for routes/menu items                                         |
| `FeatureEnabledFn<FeatureKey>` / `FeatureDependencyMap<PageId, FeatureKey>` | Feature-flag wiring for menu/sitemap filtering helpers                                |
| `BottomNavItemType<PageId>` / `BottomNavigationItemType<TId>`               | Low-level route metadata and component-facing mobile nav item contracts               |
| `BottomNavigationCenterActionType`                                          | Shared center-CTA contract for `BottomNavigation`                                     |

Example:

```ts
import {
  filterMenuByFeatureFlags,
  type FeatureDependencyMap,
  type MenuItemType,
  type MotionPreference,
} from "@sito/dashboard-app";

type AppPage = "home" | "reports" | "settings";
type FeatureKey = "reports";

const motion: MotionPreference = "auto";
const enabledFeatures: FeatureKey[] = ["reports"];

const menuMap: MenuItemType<AppPage>[] = [
  { page: "home", path: "/", type: "menu" },
  { page: "reports", path: "/reports", type: "menu" },
  { page: "settings", path: "/settings", type: "menu" },
];

const featureDependencies: FeatureDependencyMap<AppPage, FeatureKey> = {
  reports: "reports",
};

const visibleMenu = filterMenuByFeatureFlags(
  menuMap,
  (key) => enabledFeatures.includes(key),
  featureDependencies,
);
```

### 2.1 Supabase providers (optional backend)

For Supabase, keep the same outer providers and replace manager/auth pair:

`ConfigProvider` -> `SupabaseManagerProvider` -> `SupabaseAuthProvider` -> `NotificationProvider` -> `DrawerMenuProvider` -> `NavbarProvider` -> `BottomNavActionProvider` (optional)

The consumer app must provide `.env` values and instantiate client itself:

```tsx
import { createClient } from "@supabase/supabase-js";
import {
  SupabaseAuthProvider,
  SupabaseManagerProvider,
} from "@sito/dashboard-app";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

<SupabaseManagerProvider supabase={supabase}>
  <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
</SupabaseManagerProvider>;
```

`useAuth` keeps the same API with `SupabaseAuthProvider`.

Both providers compose the shared `useAuthSessionState` hook, which owns localStorage key resolution, `account` state, `clearStoredSession`, onboarding guest-state helpers, and `logUser`. Each provider only adds its own `logoutUser` / `logUserFromLocal` (and, for Supabase, the `onAuthStateChange` subscription + auth-revision guard). If you need to build a custom auth provider against the same `AuthContext`:

```tsx
import { AuthContext, useAuthSessionState } from "@sito/dashboard-app";

const CustomAuthProvider = ({ children }) => {
  const sessionState = useAuthSessionState();
  const { account, setAccount, clearStoredSession, logUser } = sessionState;

  // own logoutUser / logUserFromLocal against your backend...
  // then expose the full AuthContext value.
  // Guest entry should still be initiated from Onboarding, not auth forms.
};
```

## 3. Core Integration Rules

1. Always import from `@sito/dashboard-app`.
2. Never import from internal paths (`src/...`).
3. Use generics in entity-driven components/hooks.
4. Avoid `any`; extend base DTOs (`BaseEntityDto`, `BaseFilterDto`, etc).
5. Do not implement custom token refresh in the consumer app; use `IManager`/`BaseClient`.

## 4. Key Components and Props

| Component                     | Key props                                                                                                                                                                        | Recommended usage                                                                                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Page<T>`                     | `title`, `actions`, `showActionTooltips`, `addOptions`, `filterOptions`, `queryKey`, `isLoading`                                                                                 | CRUD layout with standard header/actions. `showActionTooltips={false}` disables tooltip wrappers for the desktop inline action row while mobile dropdown actions keep their visible labels.                                                                 |
| `PageHeader<T>`               | `title`, `actions`, `showActionTooltips`, `showBackButton`                                                                                                                       | Reusable page header with desktop/mobile actions. `showActionTooltips` applies to the desktop inline `Actions` list.                                                                                                                                        |
| `FormContainer<TForm>`        | `handleSubmit`, `onSubmit`, `reset`, `isLoading`, `buttonEnd`, `onCancel`, `submitLabel`, `cancelLabel`, `submitDisabled`, `cancelDisabled`, `actionsClassName`, `renderActions` | Form wrapper with built-in or custom submit/cancel                                                                                                                                                                                                          |
| `ParagraphInput`              | `label`, `state`, `containerClassName`, `inputClassName`, `helperText`                                                                                                           | Textarea with state-aware styling                                                                                                                                                                                                                           |
| `PasswordInput`               | `TextInputPropsType`                                                                                                                                                             | Password input with show/hide toggle                                                                                                                                                                                                                        |
| `TabsLayout`                  | `tabs`, `defaultTab`, `currentTab`, `onTabChange`, `useLinks`, `tabButtonProps`                                                                                                  | Route tabs or local state tabs                                                                                                                                                                                                                              |
| `Onboarding`                  | `steps`, `icons`, `alwaysShowIcon`, `alwaysHideIcon`, `alwaysHideLabel`, `showLabelOnMobile`, `remountStepOnChange`                                                              | Multi-step flow using controlled `TabsLayout`; horizontal swipe, Back button auto-rendered from step 2, per-action icon/display flags cascadable per-step                                                                                                   |
| `PrettyGrid<T>`               | `data`, `renderComponent`, `hasMore`, `onLoadMore`, `className`, `itemClassName`                                                                                                 | Grid with empty state and optional infinite scroll                                                                                                                                                                                                          |
| `Error`                       | Default mode (`error`, `message`, `onRetry`) or custom mode (`children`)                                                                                                         | Reusable error fallback                                                                                                                                                                                                                                     |
| `Actions<T>`                  | `actions`, `showTooltips`, `showActionTexts`, `className`, `itemClassName`, `actionClassName`                                                                                    | Inline action list. Defaults to icon-only with tooltip wrappers; use `showTooltips={false}` for dense bars or when labels are already visible.                                                                                                              |
| `Action<T>`                   | Action descriptor props + `showText`, `className`, `stopPropagation`                                                                                                             | Low-level single action button. `tooltip` still belongs on the action descriptor even when a parent `Actions` list hides visible tooltips.                                                                                                                  |
| `ActionsDropdown<T>`          | `actions`, `className`                                                                                                                                                           | Ellipsis trigger for non-sticky actions. Internally renders `Actions` with `showActionTexts` and `showTooltips={false}` inside the dropdown.                                                                                                                |
| `Dialog`                      | `open`, `title`, `handleClose`, `initialFocus`, `closeOnBackdropClick`, `mobileFullScreen`, `containerClassName`, `className`, `animationClass`                                  | Base modal. Backdrop click is disabled by default; set `closeOnBackdropClick` to `true` to close on outside click. `initialFocus="first-input"` focuses the first enabled input/textarea/select; `initialFocus="submit"` focuses the primary submit action. |
| `FormDialog<TForm>`           | `Dialog` props + `FormContainer` props + `extraActions`                                                                                                                          | Form modal with optional secondary footer actions                                                                                                                                                                                                           |
| `ConfirmationDialog`          | `open`, `title`, `handleSubmit`, `handleClose`, `isLoading`, `extraActions`, `initialFocus`                                                                                      | Basic confirmation flows. Defaults `initialFocus` to `"submit"` so Enter confirms immediately after open.                                                                                                                                                   |
| `ImportDialog<TPreview>`      | `fileProcessor`, `onFileProcessed`, `renderCustomPreview`, `onOverrideChange`, `extraActions`, `extraFields`                                                                     | Import with preview + override + custom inputs                                                                                                                                                                                                              |
| `ExportDialog`                | `handleSubmit`, `isLoading`, `extraFields`, `extraActions`                                                                                                                       | Optional export config modal (date range, format)                                                                                                                                                                                                           |
| `Drawer<MenuKeys>`            | `open`, `onClose`, `menuMap`, `logo`                                                                                                                                             | Side navigation                                                                                                                                                                                                                                             |
| `Navbar`                      | `openDrawer`, `menuButtonProps`, `showSearch`                                                                                                                                    | Top bar with dynamic title/actions                                                                                                                                                                                                                          |
| `BottomNavigation<TId>`       | `items`, `centerAction`, `isItemActive`, `className`                                                                                                                             | Mobile fixed navigation with optional center CTA                                                                                                                                                                                                            |
| `ToTop`                       | `threshold`, `tooltip`, `scrollOnClick`, `className`                                                                                                                             | Floating scroll-to-top button                                                                                                                                                                                                                               |
| `IconButton`                  | `icon: IconDefinition` + visual props                                                                                                                                            | FontAwesome-only icon contract                                                                                                                                                                                                                              |
| `TopBanner`                   | `visible`, `children`, `color` (`default`/`primary`/`secondary`/`tertiary`/`quaternary`/`info`/`success`/`warning`/`error`), `role`, `ariaLive`, `className`                     | Generic full-width banner (base for `OfflineBanner`)                                                                                                                                                                                                        |
| `OfflineBanner`               | `isOnline`, `message`, `className`                                                                                                                                               | Connectivity preset of `TopBanner` (warning, fixed)                                                                                                                                                                                                         |
| `PwaUpdateDialog`             | `open`, `onDismiss`, `onUpdate`, `title`, `description`, `dismissLabel`, `updateLabel`, `initialFocus`, `mobileFullScreen`, `containerClassName`                                 | Presentational PWA update prompt (consumer owns SW hook)                                                                                                                                                                                                    |
| `AppShell`                    | `header`, `footer`, `bottomNavigation`, `extras`, `withNotification`, `className`                                                                                                | Authenticated route shell (header/content/footer/bottomNav/extras + Notification)                                                                                                                                                                           |
| `AuthShell`                   | `children`, `withNotification`, `className`                                                                                                                                      | Auth route wrapper (children + optional Notification)                                                                                                                                                                                                       |
| `AuthSignInView`              | `title`, `emailLabel`, `passwordLabel`, `rememberLabel`, `onSubmit`                                                                                                              | Prefab sign-in route view                                                                                                                                                                                                                                   |
| `AuthSignUpView`              | `title`, `emailLabel`, `passwordLabel`, `confirmPasswordLabel`, `nameLabel`, `onSubmit`                                                                                          | Prefab sign-up route view                                                                                                                                                                                                                                   |
| `AuthRecoveryView`            | `title`, `description`, `emailLabel`, `submitLabel`, `statusMessage`, `onSubmit`, `onSecondaryAction`                                                                            | Prefab password recovery/request-confirmation view                                                                                                                                                                                                          |
| `AuthSignUpConfirmationView`  | `title`, `description`, `toSignInLabel`, `resendLabel`, `onSignIn`, `onResendConfirmEmail`                                                                                       | Prefab sign-up confirmation result view                                                                                                                                                                                                                     |
| `AuthUpdatePasswordView`      | `authApi`, `title`, `passwordLabel`, `confirmPasswordLabel`, `submitLabel`, `signInTo`                                                                                           | Prefab update-password route view                                                                                                                                                                                                                           |
| `AuthConfirmEmailSuccessView` | `authApi`, `title`, `description`, `toSignInLabel`, `signInTo`, `errorTo`, `successTo`                                                                                           | Prefab email confirmation verification view                                                                                                                                                                                                                 |
| `AuthConfirmEmailErrorView`   | `title`, `description`, `resendLabel`, `toSignInLabel`, `resendTo`, `signInTo`                                                                                                   | Prefab email confirmation error view                                                                                                                                                                                                                        |
| `DashboardHeader<MenuKeys>`   | `menuMap`, `logo`, `showOfflineBanner`, `navbarProps`                                                                                                                            | Drawer + Navbar combo with internal drawer state                                                                                                                                                                                                            |
| `DashboardFooter`             | `copyrightText`, `year`, `showToTop`, `toTopProps`, `bottomNavSpacing`, `children`, `className`, `textClassName`                                                                 | Copyright line + optional `ToTop`                                                                                                                                                                                                                           |
| `NotFoundView`                | `title`, `body`, `ctaLabel`, `ctaTo`, `className`, `titleClassName`, `bodyClassName`, `ctaClassName`                                                                             | Generic 404 fallback (router-agnostic CTA)                                                                                                                                                                                                                  |
| `FeatureUnavailableView`      | `title`, `body`, `ctaLabel`, `ctaTo`, `icon`, `className`, `iconClassName`, `titleClassName`, `bodyClassName`, `ctaClassName`                                                    | Feature-disabled fallback (icon defaults to `faWarning`)                                                                                                                                                                                                    |

## 5. Frequent Usage Examples

Copy-ready snippets live in the themed recipe files. This guide is the reference for providers, props, hooks, clients, and auth — recipes show how to assemble them.

| Task                                                          | Recipe                   |
| ------------------------------------------------------------- | ------------------------ |
| `TabsLayout` local state + onboarding flow                    | `RECIPES_FORMS.md` §5    |
| `Error` single-mode + `Empty` / `SplashScreen` / `IconButton` | `RECIPES_FORMS.md` §7    |
| `PrettyGrid` infinite scroll                                  | `RECIPES_DATA.md` §1.2   |
| `ImportDialog` — `renderCustomPreview`                        | `RECIPES_FORMS.md` §4    |
| `ImportDialog` — hook `defaultExtra` / `renderExtraFields`    | `RECIPES_FORMS.md` §4.1  |
| `ImportDialog` — component-level `extraFields`                | `RECIPES_FORMS.md` §4.2  |
| `ExportDialog` / `useExportDialog` config dialog              | `RECIPES_DATA.md` §4     |
| `useNavbar` dynamic title and right slot                      | `RECIPES_FORMS.md` §6    |
| Dialogs with `extraActions`                                   | `RECIPES_FORMS.md` §2    |
| `BottomNavigation` (mobile, center action)                    | `RECIPES_LAYOUT.md` §2.1 |
| `AppShell` / `DashboardHeader` / `DashboardFooter` layout     | `RECIPES_LAYOUT.md` §2   |
| `AuthShell` for auth routes                                   | `RECIPES_LAYOUT.md` §2.2 |
| `NotFoundView` / `FeatureUnavailableView`                     | `RECIPES_LAYOUT.md` §2.3 |
| `PwaUpdateDialog`                                             | `RECIPES_LAYOUT.md` §2.4 |
| `LegalPage` / `LegalSection` / `LegalLinksList`               | `RECIPES_LAYOUT.md` §2.5 |
| `Onboarding` step animations (`remountStepOnChange`)          | `RECIPES_FORMS.md` §5    |
| `Onboarding` Back button + per-action icon/display flags      | `RECIPES_FORMS.md` §5.1  |
| Notifications (`useNotification`)                             | `RECIPES_FORMS.md` §8    |
| Auth (`useAuth`, `rememberMe`, session restore/logout)        | `RECIPES_FORMS.md` §9    |
| Prefab auth route views                                       | `RECIPES_FORMS.md` §9.1  |
| Error guards (`isValidationError` / `isHttpError`)            | `RECIPES_FORMS.md` §10   |

Notes:

- Provider order, drawer/menu wiring, and shells live in `RECIPES_LAYOUT.md`. CRUD pages, entity clients, and exports live in `RECIPES_DATA.md`. Forms, dialogs, tabs/onboarding, navbar, feedback, notifications, and auth live in `RECIPES_FORMS.md`. `RECIPES.md` indexes all three.
- `Onboarding` step animations are opt-in per-mount via `remountStepOnChange`. Default reconciles the step tree across step changes (no animation restart). Gated by `ConfigProvider.motion` and `prefers-reduced-motion`.
- `Onboarding` supports horizontal swipe: swipe left advances, swipe right goes back, clamped to the first/last step.
- `Onboarding` action buttons render a FontAwesome icon + label. Defaults: `back=faArrowLeft`, `next=faArrowRight`, `skip=faForward`, `startAsGuest=faUserSecret`, `signIn=faRightToBracket`. Back button auto-renders from step 2 (decrements `currentStep`); pass `onClickBack` directly when using `Step` standalone.
- Four display flags — `alwaysShowIcon`, `alwaysHideIcon`, `alwaysHideLabel`, `showLabelOnMobile` — accept `boolean` (applies to every action) or `Partial<Record<actionKey, boolean>>` (per-action). Default responsive: icon-only below `28rem` (auto width), label-only at/above (min-width `10rem`). `alwaysHideIcon` makes the action label-only at every breakpoint; `alwaysHideLabel` wins when conflicting with icon display on the same action.
- All five onboarding-level controls (`icons` + the four flags) can also be set per-step on each `steps[]` entry. Per-step values merge on top of onboarding-level values per-action; step keys win, missing keys inherit. When the base flag is `boolean` and the override is a map, missing keys inherit the base boolean.

## 6. High-Level Hooks

### 6.1 Action hooks

```tsx
import { useDeleteAction, useEditAction } from "@sito/dashboard-app";

const { action: deleteAction } = useDeleteAction({
  onClick: (ids) => softDelete(ids),
});

const { action: editAction } = useEditAction({
  onClick: (id) => openEdit(id),
});
```

Prefab action hooks (`useEditAction`, `useDeleteAction`, `useRestoreAction`, `useExportAction`, `useImportAction`) also forward `className`, `iconClassName`, and `labelClassName` into the produced action descriptor, so you can style downstream `Action`/`Actions` rendering without hand-writing the action object.

### 6.2 Dialog hooks

```tsx
import { useDeleteDialog } from "@sito/dashboard-app";

const deleteDialog = useDeleteDialog({
  queryKey: ["products"],
  mutationFn: (ids) => api.products.softDelete(ids),
});
```

`useFormDialog` is now the generic dialog-form lifecycle hook and also supports local/state-only forms (filters, settings, feature flags).
For CRUD persistence, prefer wrappers:

- `usePostDialog`: create flow (no `get` by id).
- `usePutDialog`: edit flow (`getFunction` + mutate).

```tsx
import {
  ConfirmationDialog,
  FormDialog,
  useFormDialog,
  usePostDialog,
  usePutDialog,
} from "@sito/dashboard-app";

// 1) Local/state-only dialog (filters)
const filtersDialog = useFormDialog<ProductFilters>({
  mode: "state",
  title: "Filters",
  defaultValues: { search: "", minPrice: 0 },
  reinitializeOnOpen: true,
  dtoToForm: (data) => ({ ...data, ...tableFilters }),
  onSubmit: (values) => setTableFilters(values),
});

// 2) Create dialog (POST)
const createDialog = usePostDialog<CreateProductDto, ProductDto, ProductForm>({
  title: "Create product",
  defaultValues: { name: "", price: 0 },
  mutationFn: (dto) => api.products.insert(dto),
  formToDto: (values) => ({ name: values.name, price: values.price }),
  queryKey: ["products"],
  confirmation: {
    title: "Confirm product creation",
    message: "Create this product with the current form values?",
  },
});

// 3) Edit dialog (PUT)
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
  formToDto: (values, dto) => ({ id: dto?.id ?? 0, ...values }),
  queryKey: ["products"],
});

<FormDialog<ProductForm> {...createDialog}>{/* fields */}</FormDialog>;
{
  createDialog.confirmationProps ? (
    <ConfirmationDialog {...createDialog.confirmationProps} />
  ) : null;
}
```

Note:

- `useFormDialog` is state/core lifecycle only.
- Use `usePostDialog` and `usePutDialog` for remote CRUD flows.
- `usePostDialog` and `usePutDialog` accept `confirmation` to pause submit,
  show a `ConfirmationDialog`, then run the mutation only after confirmation.
  Render `dialog.confirmationProps` next to the form dialog when this option is
  set. `extraActions` can be passed through `confirmation` for secondary
  buttons.

#### Migration from legacy `useFormDialog` (removed in `v0.0.54`)

`useFormDialog` no longer accepts `mutationFn`, `queryKey`, `getFunction`, `dtoToForm`, `formToDto`. `useFormDialogLegacy` and `useEntityFormDialog` are no longer exported.

Map:

- Legacy create (mutation-only) -> `usePostDialog`
- Legacy edit (`getFunction` + mutation) -> `usePutDialog`
- Local/state-only dialog -> `useFormDialog` (`mode: "state"`)

`useFormDialog` supports `onError(error, context)` for core lifecycle failures (`submit`, `apply`, `clear`):

```tsx
const filtersDialog = useFormDialog<ProductFilters>({
  mode: "state",
  title: "Filters",
  defaultValues: { search: "", minPrice: 0 },
  onSubmit: async (values) => setTableFilters(values),
  onError: (error, { phase, values }) => {
    reportError(error, { phase, values });
  },
});
```

`openDialog` supports direct open-time hydration:

- `openDialog()`
- `openDialog(id)`
- `openDialog({ id?, values? })`

Use it when you want the next opening to reuse known values (for example, the last submitted filters):

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

const reopenFilters = () => {
  filtersDialog.openDialog({ values: lastSubmittedFilters });
};
```

When `openDialog({ values })` is used together with `reinitializeOnOpen`/`dtoToForm`, the explicit `values` passed to `openDialog` are applied for that opening.

Storybook reference: check `Hooks/Dialogs/FormDialogs` stories `StateModeSetValuesOnOpen` and `StateModeReopenWithSubmittedValues`.

### 6.3 Form hooks

```tsx
import { FormContainer, useMutationForm } from "@sito/dashboard-app";

const formProps = useMutationForm<
  ProductDto,
  CreateProductDto,
  ProductDto,
  ProductFormValues
>({
  defaultValues: { name: "", price: 0 },
  mutationFn: (data) => api.products.insert(data),
  queryKey: ["products"],
});

<FormContainer {...formProps}>{/* inputs */}</FormContainer>;
```

### 6.4 Public hook contract types

These types are exported for consumers that build wrappers around the library
hooks and want to stay aligned with the package surface.

| Type                                                                                   | Use                                                                                                      |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `UseFetchPropsType<TRow, TFilterDto>` / `UseFetchByIdPropsType`                        | Shared input contracts for entity query hooks                                                            |
| `ApiQueryResult<TDto>`                                                                 | Query result shape returned by fetch hooks, including `setTotal`                                         |
| `FormDialogMode`                                                                       | Shared `"entity" \| "state"` union used by dialog hooks                                                  |
| `FormDialogErrorPhase` / `FormDialogErrorContext<TForm>`                               | Typed error lifecycle context for `useFormDialog`                                                        |
| `OpenFormDialogParamsType<TForm>`                                                      | Open-time payload shape for `openDialog({ id?, values? })`                                               |
| `UseFormDialogReturnType<TForm>`                                                       | Return contract when composing higher-level dialog abstractions                                          |
| `UsePostDialogPropsType<...>` / `UsePutDialogPropsType<...>`                           | Props contracts for wrappers around CRUD dialog hooks                                                    |
| `UseFormPropsType<...>`                                                                | Shared prop contract for `useMutationForm`-style wrappers                                                |
| `UseActionPropTypes` / `UseSingleActionPropTypes<T>` / `UseMultipleActionPropTypes<T>` | Shared action configuration contracts                                                                    |
| `GlobalActions`                                                                        | Built-in ids for prefab page actions (`add`, `edit`, `delete`, `restore`, `refresh`, `export`, `import`) |
| `UseExportActionMutatePropsType<TData, TEntity, TError>`                               | Props contract for custom wrappers around `useExportActionMutate`                                        |

Use these when extracting app-level helpers around the library. Avoid copying
the hook signatures into local types.

### 6.5 Action rendering notes

- Keep `tooltip` populated on action descriptors. It still feeds icon-only `Actions` tooltips and remains the semantic label carried by the action shape.
- `Actions` defaults to `showTooltips={true}` and `showActionTexts={false}`. This is the icon-only toolbar mode.
- Set `showTooltips={false}` when the action bar is visually dense, when labels are already shown, or when repeated hover tooltips add noise.
- `ActionsDropdown` already renders visible labels and disables tooltip wrappers internally; you do not need to pass `showTooltips={false}` yourself for dropdown content.
- `Page` and `PageHeader` expose this as `showActionTooltips`. It only affects the desktop inline action row; mobile dropdown actions still render with visible labels and no tooltip wrappers.

## 7. Typed API clients

### 7.1 Remote client with `BaseClient`

```ts
import {
  BaseClient,
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

interface ProductCommonDto extends BaseCommonEntityDto {
  name: string;
}

interface ProductFilterDto extends BaseFilterDto {
  category?: string;
}

interface ProductUpdateDto extends DeleteDto {
  name?: string;
  price?: number;
}

class ProductsClient extends BaseClient<
  "products",
  ProductDto,
  ProductCommonDto,
  Omit<ProductDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ProductUpdateDto,
  ProductFilterDto,
  ImportPreviewDto
> {
  constructor(baseUrl: string) {
    super("products", baseUrl);
  }
}
```

### 7.2 Supabase client with `SupabaseDataClient`

```ts
import { SupabaseDataClient } from "@sito/dashboard-app";
import type { SupabaseClient } from "@supabase/supabase-js";

class ProductsSupabaseClient extends SupabaseDataClient<
  "products",
  ProductDto,
  ProductCommonDto,
  Omit<ProductDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ProductUpdateDto,
  ProductFilterDto,
  ImportPreviewDto
> {
  constructor(supabase: SupabaseClient) {
    super("products", supabase);
  }
}
```

Optional `SupabaseDataClient` options:

- `idColumn` (default `"id"`)
- `deletedAtColumn` (default `"deletedAt"`)
- `defaultSortColumn` (default `idColumn`)

### 7.3 Reusable exported data types

Consumer apps should import the shared types from `@sito/dashboard-app`
instead of redefining them locally.

| Type                                                                    | Use                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `BaseEntityDto` / `BaseCommonEntityDto` / `DeleteDto` / `BaseFilterDto` | Base DTO contracts for CRUD resources                                                                            |
| `SoftDeleteScope`                                                       | Filter union for active/deleted/all list queries                                                                 |
| `QueryResult<TDto>`                                                     | Standard paginated response shape returned by `BaseClient#get`                                                   |
| `QueryParam<TDto>`                                                      | Standard list query params (`sortingBy`, `sortingOrder`, `currentPage`, `pageSize`)                              |
| `RangeValue<T>`                                                         | Strongly typed app/domain range shape: `{ start: T; end: T }`                                                    |
| `RangeFilterValue`                                                      | Loose infra-level range shape used by `SupabaseDataClient` filter builders: `{ start?: unknown; end?: unknown }` |
| `ImportPreviewDto` / `ImportDto<TPreview>`                              | Shared import preview item and import payload contracts                                                          |
| `SessionDto<TExtra>` / `SessionAccountDto<TExtra>`                      | Shared auth session/account DTOs for REST and Supabase auth flows                                                |

Example:

```ts
import type {
  BaseEntityDto,
  BaseFilterDto,
  QueryParam,
  QueryResult,
  RangeFilterValue,
  RangeValue,
} from "@sito/dashboard-app";

type TransactionRange = RangeValue<string>;

interface TransactionDto extends BaseEntityDto {
  amount: number;
}

interface TransactionFilterDto extends BaseFilterDto {
  createdAt?: RangeFilterValue;
}

type TransactionListQuery = QueryParam<TransactionDto>;
type TransactionListResponse = QueryResult<TransactionDto>;

const selectedRange: TransactionRange = {
  start: "2026-06-01",
  end: "2026-06-30",
};
```

Prefer `RangeValue<T>` for app-owned state and DTOs where both ends are required
and strongly typed. Use `RangeFilterValue` when you need to interoperate with
generic Supabase range-filter plumbing where either end can be omitted.

## 8. Auth and notifications

### 8.1 Auth

```tsx
import { useAuth } from "@sito/dashboard-app";

const { account, logUser, logoutUser } = useAuth();
```

When your login UI has a "remember me" option, pass `rememberMe` in the auth payload.

#### 8.1.0 `RestSessionAuthClient` vs `SupabaseAuthClient`: session endpoints

The session endpoints (`login`, `refresh`, `register`, `getSession`, `logout`)
have two adapters with the same surface:

- `RestSessionAuthClient` — REST. Hits `auth/sign-in`, `auth/sign-up`,
  `auth/refresh`, `auth/sign-out`, `auth/session`. Backed by an internal
  `APIClient`.
- `SupabaseAuthClient` — Supabase Auth. Maps `supabase.auth.signInWithPassword`
  / `auth.refreshSession` / `auth.signUp` / `auth.getSession` / `auth.signOut`
  onto the same `SessionDto` shape via `mapSupabaseSessionToSessionDto`.

`AuthClient` remains exported as a backward-compatible alias of
`RestSessionAuthClient`.

`SupabaseAuthClient` adds `signUp(data)` returning a discriminated union so
callers can branch on email confirmation:

```ts
import { SupabaseAuthClient } from "@sito/dashboard-app";

const auth = new SupabaseAuthClient(supabase, {
  // optional
  defaultSignUpRedirectTo: buildAuthRedirectUrl("/auth/confirm-email"),
  mapperOptions: { defaultUsername: "guest" },
  // sessionMapper: customMapper,  // overrides mapperOptions entirely
});

const result = await auth.signUp({
  email,
  password,
  rPassword: password,
  name: "Sito", // -> options.data.{name, username}
  // username: "fallback",       // used when name is missing
  // metadata: { plan: "pro" },  // replaces the default {name, username} payload
  // redirectTo: ...,            // per-call override of defaultSignUpRedirectTo
});

if (result.status === "confirmation_required") {
  // show "check your email" screen
} else {
  await logUser(result.session, rememberMe);
}
```

`register()` keeps REST symmetry: it throws when Supabase requires
confirmation. Call `signUp()` when the UI needs to handle that branch.

#### 8.1.1 `IAuthApiClient`: password reset and email confirmation

`RestSessionAuthClient` covers the session endpoints (`login`, `register`,
`refresh`, `logout`, `getSession`). The side-channel endpoints (forgot
password, reset password, resend confirmation email, confirm email) live
behind the `IAuthApiClient` interface so the same view code can drive either
backend.

Two adapters ship with the library:

- `RestAuthRecoveryClient` — hits the conventional `auth/password/*` and
  `auth/email/confirm*` endpoints through an `APIClient` you provide. Endpoint
  paths and an optional `confirmEmailFallback` (only retried on 404) are
  configurable.
- `SupabaseAuthApiClient` — maps the same DTOs onto
  `supabase.auth.resetPasswordForEmail`, `auth.resend`, `auth.verifyOtp`,
  and `auth.setSession` / `auth.updateUser` for the access-token reset path.

`RestAuthApiClient` remains exported as a backward-compatible alias of
`RestAuthRecoveryClient`.

```ts
// REST backend
import { APIClient, RestAuthRecoveryClient } from "@sito/dashboard-app";

const api = new APIClient(config.apiUrl, config.auth.user, false, undefined, {
  rememberKey: config.auth.remember,
  refreshTokenKey: config.auth.refreshTokenKey,
  accessTokenExpiresAtKey: config.auth.accessTokenExpiresAtKey,
});
const authApi = new RestAuthRecoveryClient(api, {
  endpoints: { confirmEmailFallback: "auth/email/confirm/verify" },
});

// Supabase backend
import { SupabaseAuthApiClient } from "@sito/dashboard-app";
const authApi = new SupabaseAuthApiClient(supabase);
```

Both expose the same methods returning a normalized `IAuthApiClient` surface:

```ts
authApi.forgotPassword({ email, redirectTo });
authApi.resetPassword({ tokenHash, type: "recovery", newPassword });
authApi.resetPassword({ accessToken, refreshToken, newPassword });
authApi.resendConfirmEmail({ email, redirectTo });
authApi.confirmEmail({ tokenHash, type: "email" });
```

#### 8.1.2 Auth URL/token helpers

Confirm-email and recovery flows decode tokens from either the query string or
the hash fragment (Supabase puts recovery tokens in the hash). Use the shipped
helpers instead of re-implementing the parsing:

```ts
import {
  AuthRouteQueryParam,
  buildAuthRedirectUrl,
  extractAuthQueryParamFromLocation,
  extractAuthSessionTokensFromLocation,
  extractRecoveryAccessTokenFromLocation,
  getAuthErrorMessage,
  hasAuthErrorParamsInLocation,
  resolveConfirmEmailDtoFromLocation,
  resolveResetPasswordDtoFromLocation,
} from "@sito/dashboard-app";

const tokenHash = extractAuthQueryParamFromLocation(
  location.hash,
  location.search,
  AuthRouteQueryParam.tokenHash,
);
const redirectTo = buildAuthRedirectUrl("/auth/confirm-email", config.thisUrl);

const resetPayload = resolveResetPasswordDtoFromLocation(
  location.hash,
  location.search,
  "new-password",
);
const confirmPayload = resolveConfirmEmailDtoFromLocation(
  location.hash,
  location.search,
);
```

Reusable auth flow/helper types:

| Type                                                           | Use                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `AuthRouteQueryParamKey` / `AuthRouteQueryParamTypeKey`        | Literal unions for auth query/hash keys and token `type` values       |
| `AuthFlowStatus`                                               | Shared status union for confirm-email/update-password flows           |
| `AuthLocationInput`                                            | Minimal `{ hash, search }` location shape for auth parsing/flow hooks |
| `UseUpdatePasswordFlowOptions` / `UseUpdatePasswordFlowResult` | Contracts for `useUpdatePasswordFlow`                                 |
| `UseConfirmEmailFlowOptions` / `UseConfirmEmailFlowResult`     | Contracts for `useConfirmEmailFlow`                                   |

Prefer these exports over local string unions or hand-written interfaces when
wrapping the built-in auth helpers.

#### 8.1.3 Auth visual shells and agnostic auth views

Auth views are i18n-agnostic and route through `ConfigProvider` for location
and navigation. Pass already-translated strings/React nodes plus app route
constants; the library handles token parsing and DTO building.

Reusable primitives:

- `AuthScreenShell` — full-screen auth container with optional `logo`,
  `headerExtra`, and `motion`.
- `AuthFormShell` — prefab form layout with `text`, `password`, `checkbox`
  fields and a per-field `render` escape hatch.
- `AuthResultView` — result/success/error screen with optional loading and
  primary/secondary actions.

Flow helpers/hooks:

- `resolveResetPasswordDtoFromLocation(hash, search, newPassword)`
- `resolveConfirmEmailDtoFromLocation(hash, search)`
- `useUpdatePasswordFlow({ authApi, location, ...callbacks })`
- `useConfirmEmailFlow({ authApi, location, ...callbacks })`

Concrete views:

- `AuthSignInView`
- `AuthSignUpView`
- `AuthRecoveryView`
- `AuthSignUpConfirmationView`
- `AuthUpdatePasswordView`
- `AuthConfirmEmailSuccessView`
- `AuthConfirmEmailErrorView`

Example:

The example assumes app-owned `manager`, `authApi`, route constants,
notifications, error mappers, and translation helpers are already in scope.

```tsx
import {
  AuthConfirmEmailSuccessView,
  AuthRecoveryView,
  AuthSignInView,
  AuthSignUpConfirmationView,
  AuthSignUpView,
  AuthUpdatePasswordView,
  buildAuthRedirectUrl,
  useAuth,
  useConfig,
} from "@sito/dashboard-app";

export function SignInRoute() {
  const { logUser } = useAuth();

  return (
    <AuthSignInView
      title={t("_pages:auth.signIn.title")}
      emailLabel={t("_entities:user.email.label")}
      passwordLabel={t("_entities:user.password.label")}
      rememberLabel={t("_pages:auth.signIn.rememberMe")}
      submitLabel={t("_pages:auth.signIn.submit")}
      signUpQuestion={t("_pages:auth.signIn.toSignUp.question")}
      signUpLabel={t("_pages:auth.signIn.toSignUp.link")}
      signUpTo={AppRoutes.SignUp}
      recoveryQuestion={t("_pages:auth.signIn.toRecovery.question")}
      recoveryLabel={t("_pages:auth.signIn.toRecovery.link")}
      recoveryTo={AppRoutes.Recovery}
      onSubmit={async (values) => {
        const session = await manager.Auth.login(values);
        logUser(session, values.rememberMe);
      }}
      onError={(error) => showErrorNotification({ message: mapError(error) })}
    />
  );
}

export function SignUpRoute() {
  const { logUser } = useAuth();
  const { navigate } = useConfig();

  return (
    <AuthSignUpView
      title={t("_pages:auth.signUp.title")}
      nameLabel={t("_entities:user.name.label")}
      emailLabel={t("_entities:user.email.label")}
      passwordLabel={t("_entities:user.password.label")}
      confirmPasswordLabel={t("_entities:user.confirmPassword.label")}
      passwordMismatchMessage={t("_pages:auth.signUp.passwordMismatch")}
      submitLabel={t("_pages:auth.signUp.submit")}
      signInQuestion={t("_pages:auth.signUp.toSignIn.question")}
      signInLabel={t("_pages:auth.signUp.toSignIn.link")}
      signInTo={AppRoutes.SignIn}
      onSubmit={async ({ confirmPassword, ...values }) => {
        const session = await manager.Auth.register({
          ...values,
          rPassword: confirmPassword,
        });
        logUser(session, false);
      }}
      onError={(error) => {
        if (isEmailConfirmationRequired(error)) {
          navigate(AppRoutes.SignUpConfirmation);
          return;
        }
        showErrorNotification({ message: mapError(error) });
      }}
    />
  );
}

export function RecoveryRoute() {
  return (
    <AuthRecoveryView
      title={t("_pages:auth.recovery.title")}
      description={t("_pages:auth.recovery.description")}
      emailLabel={t("_entities:user.email.label")}
      submitLabel={t("_pages:auth.recovery.submit")}
      signInQuestion={t("_pages:auth.recovery.toSignIn.question")}
      signInLabel={t("_pages:auth.recovery.toSignIn.link")}
      signInTo={AppRoutes.SignIn}
      onSubmit={(values) =>
        authApi.forgotPassword({
          ...values,
          redirectTo: buildAuthRedirectUrl(AppRoutes.UpdatePassword),
        })
      }
      onError={(error) => showErrorNotification({ message: mapError(error) })}
    />
  );
}

export function SignUpConfirmationRoute() {
  const { navigate } = useConfig();

  return (
    <AuthSignUpConfirmationView
      title={t("_pages:auth.signUpConfirmation.title")}
      description={t("_pages:auth.signUpConfirmation.description")}
      toSignInLabel={t("_pages:auth.signUpConfirmation.toSignIn")}
      resendLabel={t("_pages:auth.signUpConfirmation.resend")}
      onSignIn={() => navigate(AppRoutes.SignIn)}
      onResendConfirmEmail={() =>
        authApi.resendConfirmEmail({
          email: pendingEmail,
          redirectTo: buildAuthRedirectUrl(AppRoutes.ConfirmEmailSuccess),
        })
      }
    />
  );
}

export function UpdatePasswordRoute() {
  return (
    <AuthUpdatePasswordView
      authApi={authApi}
      title={t("_pages:auth.updatePassword.title")}
      passwordLabel={t("_entities:user.password.label")}
      confirmPasswordLabel={t("_entities:user.confirmPassword.label")}
      submitLabel={t("_pages:auth.updatePassword.submit")}
      signInQuestion={t("_pages:auth.updatePassword.toLogin.question")}
      signInLabel={t("_pages:auth.updatePassword.toLogin.link")}
      signInTo={AppRoutes.SignIn}
      onInvalidToken={() => showErrorNotification({ message: invalidToken })}
      onError={(error) => showErrorNotification({ message: mapError(error) })}
    />
  );
}

export function ConfirmEmailRoute() {
  return (
    <AuthConfirmEmailSuccessView
      authApi={authApi}
      title={t("_pages:auth.confirmEmailSuccess.title")}
      description={t("_pages:auth.confirmEmailSuccess.description")}
      toSignInLabel={t("_pages:auth.confirmEmailSuccess.toSignIn")}
      signInTo={AppRoutes.SignIn}
      errorTo={AppRoutes.ConfirmEmailError}
      successTo={AppRoutes.ConfirmEmailSuccess}
    />
  );
}
```

#### 8.1.4 Shared form types

`SignInFormType`, `SignUpFormType`, `UpdatePasswordFormType`, and
`RecoveryFormType` are generic over a `TExtra` field set so consumers can add
their own (e.g. `name`, `username`) without forking the type.

### 8.2 Notifications

```tsx
import { useNotification } from "@sito/dashboard-app";

const { showSuccessNotification, showErrorNotification } = useNotification();

showSuccessNotification({ message: "Saved" });
showErrorNotification({ message: "Something failed" });
```

Reusable feedback types:

| Type                               | Use                                                                 |
| ---------------------------------- | ------------------------------------------------------------------- |
| `NotificationEnumType`             | Built-in success/error/warning/info variants                        |
| `NotificationType`                 | Shared notification payload contract used by `NotificationProvider` |
| `ServiceError` / `FieldErrorTuple` | Normalized service/field error shapes reused by validation handling |
| `ValidationError` / `HttpError`    | Error contracts recognized by `isValidationError` / `isHttpError`   |

If you need to map validation tuples into UI strings, reuse
`mapValidationErrors(error, mapper)` instead of rebuilding that utility in the
consumer app.

### 8.3 Connectivity hooks

`useOnlineStatus` and `useOnlineStatusSnapshot` also expose reusable helper
types:

| Type                     | Use                                                                              |
| ------------------------ | -------------------------------------------------------------------------------- |
| `UseOnlineStatusOptions` | Polling/probe configuration contract                                             |
| `OnlineStatus`           | Compact online state returned by `useOnlineStatus`                               |
| `OnlineStatusSnapshot`   | Expanded browser/server reachability state returned by `useOnlineStatusSnapshot` |

## 9. Styling, theme variables, CSS classes

Full token and CSS override reference is available at:

- `docs/THEME_AND_CSS.md`

## 10. Minimum i18n coverage

Make sure your app provides these namespaces/keys:

1. `_accessibility:buttons.*`
2. `_accessibility:ariaLabels.*`
3. `_accessibility:errors.*`
4. `_accessibility:actions.retry`
5. `_pages:common.actions.*`

`Onboarding` uses `steps` passed as props, not internal onboarding translation keys.
