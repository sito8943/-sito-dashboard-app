import type { ReactNode } from "react";

// providers
import { AuthProvider } from "./Auth";
import { BottomNavActionProvider } from "./BottomNavAction";
import { ConfigProvider } from "./ConfigProvider";
import { DrawerMenuProvider } from "./DrawerMenuProvider";
import { ManagerProvider } from "./ManagerProvider";
import { NotificationProvider } from "./NotificationProvider";

// components
import { NavbarProvider } from "components/Navbar";

// types
import type { AppProvidersProps } from "./types";
import { applyOptionalProvider } from "./appProviders.utils";

/**
 * Composes the default application provider tree with optional extension points.
 *
 * Base order:
 * ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider
 *
 * Optional wrappers:
 * NavbarProvider and BottomNavActionProvider can be enabled by flags.
 * Feature flags / offline sync / app wrapper providers can be injected as slots.
 */
const AppProviders = (props: AppProvidersProps) => {
  const {
    children,
    config,
    manager,
    auth = {},
    withNavbarProvider = false,
    withBottomNavActionProvider = false,
    featureFlagsProvider,
    offlineSyncProvider,
    appWrapperProvider,
  } = props;

  let content: ReactNode = children;

  content = applyOptionalProvider(content, appWrapperProvider);
  content = applyOptionalProvider(content, offlineSyncProvider);
  content = applyOptionalProvider(content, featureFlagsProvider);

  if (withBottomNavActionProvider)
    content = <BottomNavActionProvider>{content}</BottomNavActionProvider>;

  if (withNavbarProvider) content = <NavbarProvider>{content}</NavbarProvider>;

  content = <DrawerMenuProvider>{content}</DrawerMenuProvider>;
  content = <NotificationProvider>{content}</NotificationProvider>;

  if (auth !== false)
    content = <AuthProvider {...auth}>{content}</AuthProvider>;

  return (
    <ConfigProvider {...config}>
      <ManagerProvider {...manager}>{content}</ManagerProvider>
    </ConfigProvider>
  );
};

export { AppProviders };
export type { AppProviderSlot, AppProvidersProps } from "./types";
