import { ComponentType, ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { AuthProviderPropTypes } from "./Auth/types";
import type { ThemeProviderProps } from "./Theme/types";
import type { NotificationProviderProps } from "./Notification/types";

// lib
import {
  BaseEntityDto,
  IManager,
  NotificationType,
  Location,
  SubMenuItemType,
} from "@/lib";

// components
import { BaseLinkPropsType, BaseSearchModalPropsType } from "@/components";

export type BasicProviderPropTypes = {
  children: ReactNode;
};

type ProviderPropsWithoutChildren<T> = Omit<T, "children">;

export type AppProviderSlot<
  Props extends Record<string, unknown> = Record<string, never>,
> = {
  provider: ComponentType<BasicProviderPropTypes & Props>;
  props?: Props;
  enabled?: boolean;
};

export type AnyAppProviderSlot = AppProviderSlot<Record<string, unknown>>;

export interface AppProvidersProps extends BasicProviderPropTypes {
  config: ProviderPropsWithoutChildren<ConfigProviderPropTypes>;
  manager: ProviderPropsWithoutChildren<ManagerProviderPropTypes>;
  auth?: false | ProviderPropsWithoutChildren<AuthProviderPropTypes>;
  /**
   * Mounts `ThemeProvider` as the outermost provider when an object is passed
   * (`{}` for defaults). Omitted/`false`: not mounted.
   */
  theme?: false | ProviderPropsWithoutChildren<ThemeProviderProps>;
  /**
   * Toast options for the built-in `NotificationProvider` (`placement`,
   * `variant`, `duration`, `max`, `label`, `closeLabel`, class names).
   */
  notification?: ProviderPropsWithoutChildren<NotificationProviderProps>;
  withNavbarProvider?: boolean;
  withBottomNavActionProvider?: boolean;
  featureFlagsProvider?: AnyAppProviderSlot;
  offlineSyncProvider?: AnyAppProviderSlot;
  appWrapperProvider?: AnyAppProviderSlot;
}

export interface ManagerProviderPropTypes extends BasicProviderPropTypes {
  manager: IManager;
  queryClient?: QueryClient;
}

export type ManagerProviderContextType = {
  client: IManager;
};

export type MotionPreference = "auto" | "always" | "none";

export interface ConfigProviderPropTypes extends BasicProviderPropTypes {
  location: Location;
  navigate: (route: string | number) => void;
  linkComponent: ComponentType<BaseLinkPropsType>;
  searchComponent?: ComponentType<BaseSearchModalPropsType>;
  motion?: MotionPreference;
}

export type ConfigProviderContextType = {
  location: Location;
  navigate: (route: string | number) => void;
  linkComponent: ComponentType<BaseLinkPropsType>;
  searchComponent?: ComponentType<BaseSearchModalPropsType>;
  motion: MotionPreference;
};

export type LocalCacheProviderContextType = {
  data?: FileDataType;
  updateCache: <T = BaseEntityDto>(key: string, data: T[]) => void;
  loadCache: <T = BaseEntityDto>(key: string) => T[] | null;
  inCache: (key: string) => BaseEntityDto[];
};

export type FileCacheProviderContextType = {
  updateFile: (data: FileDataType) => Promise<void>;
  readFile: () => Promise<FileDataType | undefined>;
};

export type FileDataType = {
  [key: string]: BaseEntityDto[];
};

export type NotificationContextType = {
  /**
   * @deprecated Always an empty array. Toasts are rendered by `@sito/ui`'s
   * `ToastProvider`, which does not report auto-dismissed toasts back, so the
   * shown list is no longer tracked. Will be removed in a future minor.
   */
  notification: NotificationType[];
  /** Dismisses one notification by id, or every shown one when `id` is omitted. */
  removeNotification: (id?: number) => void;
  /** Shows an error toast. Returns its id (for `removeNotification`). */
  showErrorNotification: (options: Partial<NotificationType>) => number;
  /** Shows a toast colored by `type` (missing means error). Returns its id. */
  showNotification: (options: NotificationType) => number;
  /** Shows a success toast. Returns its id. */
  showSuccessNotification: (options: Partial<NotificationType>) => number;
  /** Shows one toast per item (they stack). Returns their ids. */
  showStackNotifications: (notifications: NotificationType[]) => number[];
};

export type DrawerMenuProviderPropTypes = BasicProviderPropTypes;

export type DrawerMenuContextType<MenuKeys extends string> = {
  addChildItem: (parentId: MenuKeys, child: SubMenuItemType) => void;
  removeChildItem: (parentId: MenuKeys, index: number) => void;
  clearDynamicItems: (parentId?: MenuKeys) => void;
  dynamicItems: Record<MenuKeys, SubMenuItemType[]>;
};
