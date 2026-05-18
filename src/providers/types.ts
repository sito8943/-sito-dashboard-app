import { ComponentType, ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { AuthProviderPropTypes } from "./Auth/types";

// lib
import {
  BaseEntityDto,
  IManager,
  NotificationType,
  Location,
  SubMenuItemType,
} from "lib";

// components
import { BaseLinkPropsType, BaseSearchModalPropsType } from "components";

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
  notification: NotificationType[];
  removeNotification: (id?: number) => void;
  showErrorNotification: (options: Partial<NotificationType>) => void;
  showNotification: (options: NotificationType) => void;
  showSuccessNotification: (options: Partial<NotificationType>) => void;
  showStackNotifications: (notifications: NotificationType[]) => void;
};

export type DrawerMenuProviderPropTypes = BasicProviderPropTypes;

export type DrawerMenuContextType<MenuKeys extends string> = {
  addChildItem: (parentId: MenuKeys, child: SubMenuItemType) => void;
  removeChildItem: (parentId: MenuKeys, index: number) => void;
  clearDynamicItems: (parentId?: MenuKeys) => void;
  dynamicItems: Record<MenuKeys, SubMenuItemType[]>;
};
