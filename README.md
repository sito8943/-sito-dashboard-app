# @sito/dashboard-app

## Overview
`@sito/dashboard-app` is the npm package that bundles Sitō’s dashboard component library. It ships production-ready React components, opinionated hooks, data utilities (HTTP clients, DTOs, providers) and the required styles so you can build admin panels, CRUD views and internal tools on top of React 18. The package re-exports the primitives from `@sito/dashboard`, exposes TypeScript types, and keeps the UI and data layers aligned.

## Key capabilities
- **Production-ready components**: Pages, navigation bars, tabbed layouts, dialogs, dropdowns and buttons that match the Sitō design system.
- **Built-in critical flows**: Confirmation modals, forms, import dialogs with preview, notifications and loading states ready to wire into your endpoints.
- **Opinionated hooks**: `useImportDialog`, `useDeleteDialog`, `usePostForm`, `useDeleteAction`, `useScrollTrigger` and more to remove boilerplate from common flows.
- **Typed API clients and DTOs**: `APIClient`, `BaseClient`, `AuthClient` plus base/user/import DTOs to keep backend contracts synchronized with the UI.
- **Internationalization and accessibility**: Every component leverages the contexts and helpers from `@sito/dashboard` to keep translations, shortcuts and accessibility consistent.

## Core exports
- **Layout & navigation**: `Page`, `Navbar`, `Drawer`, `TabsLayout`, `PrettyGrid`.
- **Actions & menus**: `Actions`, `Action`, `Buttons`, `Dropdown`, `ToTop`.
- **Dialogs & forms**: `Dialog`, `DialogActions`, `FormDialog`, `ImportDialog`, `FormContainer`, `ParagraphInput`, `PasswordInput`.
- **Visual feedback**: `Notification`, `Loading` / `SplashScreen`, `Empty`, `Error`, `Onboarding`.
- **Business hooks**: `useImportDialog`, `useFormDialog`, `useDeleteDialog`, `useImportAction`, `useDeleteAction`, `useRestoreAction`, `usePostForm`, `useConfirmationForm`, `useTimeAge`.
- **Providers & utilities**: `ManagerProvider`, `NotificationProvider`, `AuthProvider`, `ConfigProvider`, `queryClient`, helpers for dates, navigation, local storage and enums.

## Quick example: import action dialog
The snippet below shows how to combine `Page`, the import hooks and `ImportDialog` to enable a batch upload experience. It assumes your app is already wrapped with the providers described in the next section.

```tsx
import type { BaseEntityDto, ImportPreviewDto } from "@sito/dashboard-app";
import {
  APIClient,
  ImportDialog,
  Page,
  useImportDialog,
  useNotification,
} from "@sito/dashboard-app";

type CustomerDto = BaseEntityDto & {
  name: string;
  email: string;
};

type CustomerPreview = ImportPreviewDto & {
  name: string;
  email: string;
};

const api = new APIClient(import.meta.env.VITE_API_URL);

const parseCustomersCsv = async (
  file: File
): Promise<CustomerPreview[]> => {
  // Use your preferred CSV parser and return typed items
  return [];
};

export function CustomersPage() {
  const { showErrorNotification } = useNotification();

  const importDialog = useImportDialog<CustomerDto, CustomerPreview>({
    entity: "customers",
    queryKey: ["customers"],
    mutationFn: (payload) => api.post("/customers/import", payload),
    fileProcessor: parseCustomersCsv,
    onError: () =>
      showErrorNotification({
        title: "The file could not be processed",
      }),
  });

  return (
    <>
      <Page
        title="Customers"
        subtitle="Manage your audience"
        queryKey={["customers"]}
        actions={[importDialog.action()]}
      >
        {/* Mount your table or grid here */}
      </Page>

      <ImportDialog {...importDialog} />
    </>
  );
}
```

## Installation
Install the library with your preferred package manager:

```bash
npm install @sito/dashboard-app
# or
yarn add @sito/dashboard-app
# or
pnpm add @sito/dashboard-app
```

## Initial setup
Wrap your application with the provided providers to enable navigation, React Query, authentication and notifications. `ConfigProvider` needs the current `location`, a `navigate` function (for example from React Router) and a link component; `ManagerProvider` exposes the shared `queryClient` and requires an instance of `IManager` that encapsulates your HTTP services.

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
      <AppProviders>
        <CustomersPage />
      </AppProviders>
    </BrowserRouter>
  );
}
```

## Local development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/sito-dashboard-app.git
   cd sito-dashboard-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## Build the library
Produce the distributable artifacts by running:

```bash
npm run build
```

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a descriptive branch for your feature or fix.
3. Open a pull request explaining the change and how to test it.

## License
This project is licensed under the MIT License.
