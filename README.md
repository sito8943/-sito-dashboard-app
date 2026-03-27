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
- For `@sito/dashboard-app` provider setup, use `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when needed).
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
- React `18.3.1`
- React DOM `18.3.1`
- `@tanstack/react-query` `5.83.0`
- `@supabase/supabase-js` `2.100.0` (optional; only if using Supabase backend)
- `react-hook-form` `7.61.1`
- `@sito/dashboard` `^0.0.74`
- Font Awesome peers defined in `package.json`

Install all peers in consumer apps:

```bash
npm install \
  react@18.3.1 react-dom@18.3.1 \
  @sito/dashboard@^0.0.74 \
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

- Layout and navigation: `Page`, `Navbar`, `Drawer`, `TabsLayout`, `PrettyGrid`, `ToTop`
- Actions and menus: `Actions`, `Action`, `Dropdown`, button components
- Dialogs and forms: `Dialog`, `FormDialog`, `ImportDialog`, form inputs
- Feedback: `Notification`, `Loading`, `Empty`, `Error`, `Onboarding`
- Hooks: `useFormDialog` (generic state/entity), `usePostDialog`, `usePutDialog`, `useImportDialog`, `useDeleteDialog`, `usePostForm`, `useDeleteAction`, `useNavbar`, and more — all action hooks ship with default `sticky`, `multiple`, `id`, `icon`, and `tooltip` values so only `onClick` is required
- Providers and utilities: `ConfigProvider`, `ManagerProvider`, `SupabaseManagerProvider`, `AuthProvider`, `SupabaseAuthProvider`, `NotificationProvider`, `DrawerMenuProvider`, `NavbarProvider`, DTOs, API clients (`BaseClient`, `IndexedDBClient`, `SupabaseDataClient`), and `useSupabase`

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
  mapOut: (form) => ({ name: form.name, price: form.price }),
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
  mapOut: (form, dto) => ({ id: dto?.id ?? 0, ...form }),
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
              <NavbarProvider>{children}</NavbarProvider>
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
- `NavbarProvider` is required when using `Navbar` or `useNavbar`; otherwise it can be omitted.
- If you customize auth storage keys in `AuthProvider`, pass the same keys to `IManager`/`BaseClient` auth config.

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
    >
      <SupabaseManagerProvider supabase={supabase}>
        <SupabaseAuthProvider>
          <NotificationProvider>
            <DrawerMenuProvider>
              <NavbarProvider>{children}</NavbarProvider>
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
- `npm run lint`: run ESLint
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

Run formatting:

```bash
npm run format
```

## Deployment / release

CI is available through GitHub Actions:

- `.github/workflows/ci.yml`: runs `lint + docs:check + test + build` on `push` and `pull_request`
- `.github/workflows/lint.yml`: runs `lint + docs:check` on `push` and `pull_request`

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
