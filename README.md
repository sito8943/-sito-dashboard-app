# @sito/dashboard-app

`@sito/dashboard-app` is a React 18 component and utilities library for building Sito-style admin dashboards, CRUD screens, and internal tools. It packages UI components, hooks, providers, typed API helpers, and styles in a single npm package.

## Installation

```bash
npm install @sito/dashboard-app
# or
yarn add @sito/dashboard-app
# or
pnpm add @sito/dashboard-app
```

## Requirements

- Node.js `18.18.0` (see `.nvmrc`)
- React `18.3.1`
- React DOM `18.3.1`
- `@tanstack/react-query` `5.83.0`
- `react-hook-form` `7.61.1`
- `@sito/dashboard` `^0.0.68`
- Font Awesome + Emotion peers defined in `package.json`

## Core exports

- Layout and navigation: `Page`, `Navbar`, `Drawer`, `TabsLayout`, `PrettyGrid`
- Actions and menus: `Actions`, `Action`, `Dropdown`, button components
- Dialogs and forms: `Dialog`, `FormDialog`, `ImportDialog`, form inputs
- Feedback: `Notification`, `Loading`, `Empty`, `Error`, `Onboarding`
- Hooks: `useImportDialog`, `useDeleteDialog`, `usePostForm`, `useDeleteAction`, `useNavbar`, and more — all action hooks ship with default `sticky`, `multiple`, `id`, `icon`, and `tooltip` values so only `onClick` is required
- Providers and utilities: `ConfigProvider`, `ManagerProvider`, `AuthProvider`, `NotificationProvider`, `NavbarProvider`, DTOs, API clients

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
/>
```

`tabButtonProps` lets you customize each tab button style/behavior (except `onClick` and `children`, which are controlled by `TabsLayout`).

### Onboarding

`Onboarding` accepts structured steps instead of translation keys. Each step provides `title`, `body`, and optional `content` for custom UI below the body.

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
    },
  ]}
/>
```

## Initial setup example

Wrap your app with the providers to enable navigation, React Query integration, auth context, and notifications.

```tsx
import type { ReactNode } from "react";
import { BrowserRouter, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthProvider,
  ConfigProvider,
  IManager,
  ManagerProvider,
  NotificationProvider,
} from "@sito/dashboard-app";

const manager = new IManager(import.meta.env.VITE_API_URL);

function AppProviders({ children }: { children: ReactNode }) {
  const go = useNavigate();
  const location = useLocation();

  return (
    <ConfigProvider
      location={location}
      navigate={(route) => go(route)}
      linkComponent={Link}
    >
      <ManagerProvider manager={manager}>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
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
- `npm run test`: run unit/component tests once (Vitest)
- `npm run test:watch`: run tests in watch mode
- `npm run format`: run Prettier write mode
- `npm run storybook`: run Storybook locally
- `npm run build-storybook`: generate static Storybook build

## Offline-first / IndexedDB fallback

`IndexedDBClient` is a drop-in offline alternative to `BaseClient`. It exposes the exact same method surface (`insert`, `insertMany`, `update`, `get`, `getById`, `export`, `import`, `commonGet`, `softDelete`, `restore`) but stores data locally in the browser's IndexedDB instead of calling a remote API.

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
  ProductDto,           // TCommonDto
  Omit<ProductDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ProductDto,           // TUpdateDto (extends DeleteDto via BaseEntityDto)
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
  const [client, setClient] = useState(
    () => navigator.onLine ? new ProductsClient(apiUrl) : new ProductsIndexedDBClient()
  );

  useEffect(() => {
    const goOnline  = () => setClient(new ProductsClient(apiUrl));
    const goOffline = () => setClient(new ProductsIndexedDBClient());
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return client;
}
```

> **Note:** `IndexedDBClient` requires a browser environment. It will not work in SSR/Node contexts.

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

- `.github/workflows/ci.yml`: runs `lint + test + build` on `push` and `pull_request`
- `.github/workflows/lint.yml`: runs lint checks on `push` and `pull_request`

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
