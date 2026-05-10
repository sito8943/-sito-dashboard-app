import type { ComponentType, ReactNode } from "react";

// providers
import { AuthProvider } from "./Auth";
import { BottomNavActionProvider } from "./BottomNavAction";
import { ConfigProvider } from "./ConfigProvider";
import { DrawerMenuProvider } from "./DrawerMenuProvider";
import { ManagerProvider } from "./ManagerProvider";
import { NotificationProvider } from "./NotificationProvider";

// components
import { NavbarProvider } from "components/Navbar/NavbarProvider";

// types
import type { AuthProviderPropTypes } from "./Auth";
import type {
  BasicProviderPropTypes,
  ConfigProviderPropTypes,
  ManagerProviderPropTypes,
} from "./types";

type ProviderPropsWithoutChildren<T> = Omit<T, "children">;

export type AppProviderSlot<
  Props extends Record<string, unknown> = Record<string, never>,
> = {
  provider: ComponentType<BasicProviderPropTypes & Props>;
  props?: Props;
  enabled?: boolean;
};

type AnyAppProviderSlot = AppProviderSlot<Record<string, unknown>>;

export interface AppProvidersProps extends BasicProviderPropTypes {
  config: ProviderPropsWithoutChildren<ConfigProviderPropTypes>;
  manager: ProviderPropsWithoutChildren<ManagerProviderPropTypes>;
  auth?: false | ProviderPropsWithoutChildren<AuthProviderPropTypes>;
  withNavbarProvider?: boolean;
  withBottomNavActionProvider?: boolean;
  featureFlagsProvider?: AnyAppProviderSlot;
  offlineSyncProvider?: AnyAppProviderSlot;
  appWrapperProvider?: AnyAppProviderSlot;
}

const applyOptionalProvider = (
  children: ReactNode,
  slot?: AnyAppProviderSlot,
): ReactNode => {
  if (!slot || slot.enabled === false) return children;

  const { provider: Provider, props } = slot;

  return <Provider {...(props ?? {})}>{children}</Provider>;
};

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

/**
 * Returns a configured provider component so apps can avoid repeating the tree.
 */
const createAppProviders = (
  config: Omit<AppProvidersProps, "children">,
): ComponentType<BasicProviderPropTypes> => {
  const CreatedAppProviders = ({ children }: BasicProviderPropTypes) => (
    <AppProviders {...config}>{children}</AppProviders>
  );

  return CreatedAppProviders;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AppProviders, createAppProviders };
