import { ReactNode } from "react";

// lib
import { BaseEntityDto, IManager, NotificationType, SessionDto } from "lib";

export type BasicProviderPropTypes = {
  children: ReactNode;
};

export interface AuthProviderPropTypes extends BasicProviderPropTypes {
  guestMode?: string;
  user?: string;
}

export interface ManagerProviderPropTypes extends BasicProviderPropTypes {
  manager: IManager;
}

export type ManagerProviderContextType = {
  client: IManager;
};

export type AuthProviderContextType = {
  account: SessionDto;
  logUser: (data: SessionDto) => void;
  logoutUser: () => void;
  logUserFromLocal: () => Promise<void>;
  isInGuestMode: () => boolean;
  setGuestMode: (value: boolean) => void;
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
  removeNotification: (index?: number) => void;
  showErrorNotification: (options: Partial<NotificationType>) => void;
  showNotification: (options: NotificationType) => void;
  showSuccessNotification: (options: Partial<NotificationType>) => void;
  showStackNotifications: (notifications: NotificationType[]) => void;
};
