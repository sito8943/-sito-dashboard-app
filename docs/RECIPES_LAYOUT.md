# Layout & Provider Recipes for `@sito/dashboard-app`

Provider bootstrap, app shell helpers, routing/auth shells, fallback views, PWA update dialog, drawer menu hooks.

## 1. Required provider bootstrap (correct order)

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
  const location = useLocation();
  const navigate = useNavigate();

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
      {/* ManagerProvider already mounts QueryClientProvider internally */}
      <ManagerProvider manager={manager}>
        <AuthProvider
          user={authStorageKeys.user}
          remember={authStorageKeys.remember}
          refreshTokenKey={authStorageKeys.refreshTokenKey}
          accessTokenExpiresAtKey={authStorageKeys.accessTokenExpiresAtKey}
        >
          <NotificationProvider>
            <DrawerMenuProvider>
              {/* Optional unless you use Navbar/useNavbar */}
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
```

`ConfigProvider.motion`: `"auto"` respects `prefers-reduced-motion`; `"none"` disables library transitions; `"always"` keeps them on regardless of OS preference.

## 2. Base app shell with layout helpers (`AppShell` + `DashboardHeader` + `DashboardFooter`)

Prefer bundled shells over hand-rolling Navbar/Drawer/Footer wiring. `AppShell` mounts slots in fixed order (`header → children → footer → bottomNavigation → extras → Notification`); `DashboardHeader` owns drawer open/close state internally.

```tsx
import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { faBox, faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AppShell,
  DashboardFooter,
  DashboardHeader,
  MenuItemType,
} from "@sito/dashboard-app";

type AppPages = "home" | "products";

export function AppLayout() {
  const menuMap = useMemo<MenuItemType<AppPages>[]>(
    () => [
      {
        page: "home",
        path: "/",
        icon: <FontAwesomeIcon icon={faHouse} />,
        type: "menu",
      },
      {
        page: "products",
        path: "/products",
        icon: <FontAwesomeIcon icon={faBox} />,
        type: "menu",
      },
    ],
    [],
  );

  return (
    <AppShell
      header={
        <DashboardHeader<AppPages>
          menuMap={menuMap}
          showOfflineBanner
          navbarProps={{ showSearch: true }}
        />
      }
      footer={
        <DashboardFooter
          copyrightText="© Acme Corp"
          toTopProps={{ threshold: 160, tooltip: "Back to top" }}
        />
      }
      extras={<Tooltip id="tooltip" />}
    >
      <Outlet />
    </AppShell>
  );
}
```

Notes:

- `AppShell` mounts `<Notification />` at end of slot order. Pass `withNotification={false}` only when mounting your own portal.
- `DashboardHeader` is generic over `MenuKeys`. Drawer state lives inside; consumers supply `menuMap` and optional `logo` / `showOfflineBanner` / `navbarProps`.
- `DashboardFooter` renders `ToTop` by default. Toggle with `showToTop={false}` or customize via `toTopProps`. Set `bottomNavSpacing` when also mounting `BottomNavigation`.

For hand-rolled shells, lower-level `Navbar`/`Drawer`/`Notification`/`ToTop` primitives remain available.

### 2.1 Mobile bottom nav with `BottomNavigation`

For quick primary navigation on mobile while keeping the desktop drawer/navbar flow.

```tsx
import {
  BottomNavigation,
  type BottomNavigationItemType,
} from "@sito/dashboard-app";
import {
  faBox,
  faHouse,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type BottomNavId = "home" | "products" | "profile";

const bottomNavItems: BottomNavigationItemType<BottomNavId>[] = [
  { id: "home", label: "Home", to: "/", icon: faHouse, position: "left" },
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
  items={bottomNavItems}
  centerAction={{
    icon: faPlus,
    to: "/products/new",
    ariaLabel: "Create product",
  }}
/>;
```

Dynamic center-action override (optional provider):

```tsx
import {
  BottomNavActionProvider,
  BottomNavigation,
  useRegisterBottomNavAction,
  type BottomNavigationItemType,
} from "@sito/dashboard-app";
import { faTags } from "@fortawesome/free-solid-svg-icons";

function CategoriesCenterAction() {
  useRegisterBottomNavAction({
    icon: faTags,
    ariaLabel: "Create category",
    to: "/categories/new",
  });
  return null;
}

<BottomNavActionProvider>
  <CategoriesCenterAction />
  <BottomNavigation
    items={bottomNavItems}
    centerAction={{ ariaLabel: "Create product", to: "/products/new" }}
  />
</BottomNavActionProvider>;
```

`BottomNavigation` uses `ConfigProvider` routing primitives under the hood and renders only on mobile by default (`sm:hidden`).

### 2.2 Auth route shell with `AuthShell`

Wrap auth routes with `AuthShell` so `Notification` portal stays mounted pre-sign-in. Redirect/error-boundary logic stays in the consumer.

```tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthShell, useAuth } from "@sito/dashboard-app";

import { AppRoutes, publicAuthRoutes } from "../lib/routes";

export function AuthLayout() {
  const { account } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account.email) return;
    if (publicAuthRoutes.has(location.pathname)) return;
    navigate(AppRoutes.Home);
  }, [account.email, location.pathname, navigate]);

  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  );
}
```

Opt out of the built-in toast portal with `withNotification={false}`.

### 2.3 Reusable fallback views (`NotFoundView`, `FeatureUnavailableView`)

Both consume `linkComponent` from `ConfigProvider` (router-agnostic). Pass `ctaTo` from your `routes.ts` constants — never hardcode.

```tsx
import { useTranslation } from "react-i18next";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FeatureUnavailableView, NotFoundView } from "@sito/dashboard-app";

import { AppRoutes } from "../lib/routes";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <NotFoundView
      title={t("_pages:notFound.title")}
      body={t("_pages:notFound.body")}
      ctaLabel={t("_pages:home.title")}
      ctaTo={AppRoutes.Home}
    />
  );
}

export function FeatureDisabledPage({ module }: { module: string }) {
  const { t } = useTranslation();

  return (
    <FeatureUnavailableView
      icon={faLock}
      title={t("_pages:featureFlags.route.title")}
      body={t("_pages:featureFlags.route.body", {
        module: t(`_pages:featureFlags.modules.${module}`),
      })}
      ctaLabel={t("_pages:featureFlags.route.cta")}
      ctaTo={AppRoutes.Home}
    />
  );
}
```

`FeatureUnavailableView.icon` defaults to `faWarning`. Both accept className overrides (`className`, `titleClassName`, `bodyClassName`, `ctaClassName`, plus `iconClassName` on `FeatureUnavailableView`) merged after base classes — consumer CSS keeps targeting `.not-found-view-*` / `.feature-unavailable-view-*`.

### 2.4 PWA update prompt with `PwaUpdateDialog`

Presentational only: consumer owns the SW source (custom hook, `vite-plugin-pwa`'s `useRegisterSW`, etc.). Mount inside `AppShell.extras`.

Using `vite-plugin-pwa`:

```tsx
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import { PwaUpdateDialog } from "@sito/dashboard-app";

export function PwaUpdate() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <PwaUpdateDialog
      open={needRefresh}
      onDismiss={() => setNeedRefresh(false)}
      onUpdate={() => updateServiceWorker(true)}
      title={t("_pages:pwaUpdate.title")}
      description={t("_pages:pwaUpdate.description")}
      dismissLabel={t("_pages:pwaUpdate.actions.later")}
      updateLabel={t("_pages:pwaUpdate.actions.update")}
    />
  );
}
```

Using a vanilla `navigator.serviceWorker` setup:

```tsx
import { useEffect, useRef, useState } from "react";
import { PwaUpdateDialog } from "@sito/dashboard-app";

function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        registrationRef.current = registration;
        if (registration.waiting) setNeedRefresh(true);

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setNeedRefresh(true);
            }
          });
        });
      });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  return {
    needRefresh,
    dismissUpdate: () => setNeedRefresh(false),
    applyUpdate: () =>
      registrationRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" }),
  };
}

export function PwaUpdate() {
  const { needRefresh, dismissUpdate, applyUpdate } = useServiceWorkerUpdate();
  return (
    <PwaUpdateDialog
      open={needRefresh}
      onDismiss={dismissUpdate}
      onUpdate={applyUpdate}
      title="Update available"
      description="A new version is ready. Reload to apply."
      dismissLabel="Later"
      updateLabel="Update"
    />
  );
}
```

Library never imports `navigator.serviceWorker` or `virtual:pwa-register/react` — only the consumer.

## 3. Dynamic drawer children with `useDrawerMenu`

```tsx
import { useEffect } from "react";
import { useDrawerMenu, type SubMenuItemType } from "@sito/dashboard-app";

type MenuKeys = "products" | "orders";

export function ProductsDynamicMenuItems() {
  const { addChildItem, clearDynamicItems } = useDrawerMenu<MenuKeys>();

  useEffect(() => {
    const dynamicItem: SubMenuItemType = {
      id: "products-import-history",
      label: "Import history",
      path: "/products/import-history",
    };

    addChildItem("products", dynamicItem);

    return () => {
      clearDynamicItems("products");
    };
  }, [addChildItem, clearDynamicItems]);

  return null;
}
```
