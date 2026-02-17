import { ReactNode } from "react";

/**
 * The pathname, search, and hash values of a URL.
 */
export interface Path {
  /**
   * A URL pathname, beginning with a /.
   */
  pathname: string;
  /**
   * A URL search string, beginning with a ?.
   */
  search: string;
  /**
   * A URL fragment identifier, beginning with a #.
   */
  hash: string;
}

/**
 * An entry in a history stack. A location contains information about the
 * URL path, as well as possibly some arbitrary state and a key.
 */
export interface Location<State = any> extends Path {
  /**
   * A value of arbitrary data associated with this location.
   */
  state: State;
  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   */
  key: string;
}

export type ViewPageType<PageId> = {
  key: PageId;
  path: string;
  children?: ViewPageType<PageId>[];
  role?: string[];
};

export interface NamedViewPageType<PageId> extends ViewPageType<PageId> {
  name: string;
}

export type SubMenuItemType = {
  id: string;
  label: string;
  path?: string;
};

export type MenuItemType<MenuKeys> = {
  id?: string;
  page?: MenuKeys;
  path?: string;
  icon?: ReactNode;
  type?: "menu" | "divider";
  auth?: boolean;
  children?: SubMenuItemType[];
};
