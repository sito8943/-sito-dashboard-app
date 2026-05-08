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
export interface Location<State = unknown> extends Path {
  /**
   * A value of arbitrary data associated with this location.
   */
  state?: State;
  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   */
  key?: string;
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

export type FeatureEnabledFn<FeatureKey extends string> = (
  key: FeatureKey,
) => boolean;

/**
 * Filters menu entries based on optional feature-flag dependencies by page id.
 * @param items - Menu entries to filter.
 * @param isFeatureEnabled - Function that resolves whether a feature key is enabled.
 * @param dependencies - Mapping between page ids and required feature flags.
 * @returns Filtered menu entries preserving original order.
 */
export function filterMenuByFeatureFlags<
  Item extends { page?: string },
  FeatureKey extends string,
>(
  items: Item[],
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: Partial<Record<NonNullable<Item["page"]>, FeatureKey>>,
): Item[] {
  return items.filter((item) => {
    const page = item.page;

    if (!page) return true;

    const dependency = dependencies[page as NonNullable<Item["page"]>];
    if (!dependency) return true;

    return isFeatureEnabled(dependency);
  });
}

/**
 * Removes leading, trailing and duplicated consecutive dividers from menu entries.
 * @param items - Menu entries to normalize.
 * @returns Cleaned menu entries preserving valid dividers.
 */
export function normalizeMenuDividers<Item extends { type?: string }>(
  items: Item[],
): Item[] {
  const normalized: Item[] = [];

  for (const item of items) {
    const isDivider = item.type === "divider";
    if (!isDivider) {
      normalized.push(item);
      continue;
    }

    if (normalized.length === 0) continue;
    if (normalized[normalized.length - 1]?.type === "divider") continue;

    normalized.push(item);
  }

  if (normalized[normalized.length - 1]?.type === "divider") {
    normalized.pop();
  }

  return normalized;
}
