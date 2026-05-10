import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BaseLinkPropsType } from "components/types";
import { useNavbar } from "components/Navbar/NavbarProvider";
import type { IManager, Location } from "lib";

import { useAuth } from "./Auth";
import { useBottomNavAction } from "./BottomNavAction";
import {
  AppProviders,
  createAppProviders,
  type AppProviderSlot,
} from "./AppProviders";
import { useConfig } from "./ConfigProvider";
import { useDrawerMenu } from "./DrawerMenuProvider";
import { useManager } from "./ManagerProvider";
import { useNotification } from "./NotificationProvider";
import type { BasicProviderPropTypes } from "./types";

const manager = {
  Auth: {
    logout: vi.fn(),
    getSession: vi.fn(),
  },
} as unknown as IManager;

const location: Location = {
  pathname: "/dashboard",
  search: "",
  hash: "",
};

const LinkComponent = ({ to, children, ...props }: BaseLinkPropsType) => (
  <a href={to} {...props}>
    {children}
  </a>
);

const baseProps = {
  config: {
    location,
    navigate: vi.fn(),
    linkComponent: LinkComponent,
  },
  manager: {
    manager,
  },
};

const CoreConsumer = () => {
  const config = useConfig();
  const managerFromContext = useManager();
  const { account } = useAuth();
  const { notification } = useNotification();
  const { dynamicItems } = useDrawerMenu<string>();

  return (
    <>
      <span data-testid="pathname">{config.location.pathname}</span>
      <span data-testid="manager-match">
        {String(managerFromContext === manager)}
      </span>
      <span data-testid="has-auth">{String(typeof account === "object")}</span>
      <span data-testid="notification-count">
        {String(notification.length)}
      </span>
      <span data-testid="drawer-count">
        {String(Object.keys(dynamicItems).length)}
      </span>
    </>
  );
};

const AuthConsumer = () => {
  useAuth();
  return <span>auth</span>;
};

const ExtendedConsumer = () => {
  const { title } = useNavbar();
  const { centerAction } = useBottomNavAction();

  return (
    <>
      <span data-testid="navbar-title">{title}</span>
      <span data-testid="bottom-nav-action-null">
        {String(centerAction === null)}
      </span>
    </>
  );
};

const FeatureFlagsProvider = ({ children }: BasicProviderPropTypes) => (
  <div data-testid="feature-flags-provider">{children}</div>
);

const OfflineSyncProvider = ({
  children,
  mode,
}: BasicProviderPropTypes & { mode?: string }) => (
  <div data-testid={`offline-sync-provider-${mode}`}>{children}</div>
);

const AppWrapperProvider = ({ children }: BasicProviderPropTypes) => (
  <div data-testid="app-wrapper-provider">{children}</div>
);

describe("AppProviders", () => {
  it("composes the base provider tree with auth enabled by default", () => {
    render(
      <AppProviders {...baseProps}>
        <CoreConsumer />
      </AppProviders>,
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent("/dashboard");
    expect(screen.getByTestId("manager-match")).toHaveTextContent("true");
    expect(screen.getByTestId("has-auth")).toHaveTextContent("true");
    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("drawer-count")).toHaveTextContent("0");
  });

  it("allows disabling AuthProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() =>
      render(
        <AppProviders {...baseProps} auth={false}>
          <AuthConsumer />
        </AppProviders>,
      ),
    ).toThrow("useAuthContext must be used within AuthProvider");

    consoleErrorSpy.mockRestore();
  });

  it("supports optional provider slots and optional navbar/bottom-nav providers", () => {
    const featureFlagsProvider: AppProviderSlot<Record<string, unknown>> = {
      provider: FeatureFlagsProvider,
    };
    const offlineSyncProvider: AppProviderSlot<Record<string, unknown>> = {
      provider: OfflineSyncProvider,
      props: { mode: "auto" },
    };
    const appWrapperProvider: AppProviderSlot<Record<string, never>> = {
      provider: AppWrapperProvider,
    };

    render(
      <AppProviders
        {...baseProps}
        withNavbarProvider
        withBottomNavActionProvider
        featureFlagsProvider={featureFlagsProvider}
        offlineSyncProvider={offlineSyncProvider}
        appWrapperProvider={appWrapperProvider}
      >
        <ExtendedConsumer />
      </AppProviders>,
    );

    expect(screen.getByTestId("feature-flags-provider")).toBeInTheDocument();
    expect(
      screen.getByTestId("offline-sync-provider-auto"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("app-wrapper-provider")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-title")).toHaveTextContent("");
    expect(screen.getByTestId("bottom-nav-action-null")).toHaveTextContent(
      "true",
    );
  });
});

describe("createAppProviders", () => {
  it("returns a preconfigured providers component", () => {
    const Providers = createAppProviders({
      ...baseProps,
      auth: false,
    });

    render(
      <Providers>
        <span data-testid="child">ok</span>
      </Providers>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("ok");
  });
});
