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
- `@sito/dashboard` `^0.0.61`
- Font Awesome + Emotion peers defined in `package.json`

## Core exports

- Layout and navigation: `Page`, `Navbar`, `Drawer`, `TabsLayout`, `PrettyGrid`
- Actions and menus: `Actions`, `Action`, `Dropdown`, button components
- Dialogs and forms: `Dialog`, `FormDialog`, `ImportDialog`, form inputs
- Feedback: `Notification`, `Loading`, `Empty`, `Error`, `Onboarding`
- Hooks: `useImportDialog`, `useDeleteDialog`, `usePostForm`, `useDeleteAction`, and more
- Providers and utilities: `ConfigProvider`, `ManagerProvider`, `AuthProvider`, `NotificationProvider`, DTOs, API clients

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
- `npm run format`: run Prettier write mode
- `npm run storybook`: run Storybook locally
- `npm run build-storybook`: generate static Storybook build

## Tests

This repository currently does not define an automated test runner script (`npm run test` is not available yet). Current validation is done through:

- `npm run lint`
- `npm run build`
- Storybook/manual behavior checks

If you add automated tests later, expose them through a `test` script in `package.json` and document the command in this section.

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

There is no CI/CD deployment workflow committed in this repository right now. Package release is handled manually.

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
