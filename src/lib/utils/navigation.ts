import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ElementType, ReactNode } from "react";
import type { SessionAccountDto } from "../entities/auth";

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

export type AccessGuard = (account?: SessionAccountDto) => boolean;

export type ViewPageType<PageId extends string = string> = {
  key: PageId;
  path: string;
  children?: ViewPageType<PageId>[];
  role?: string[];
  access?: AccessGuard;
};

export interface NamedViewPageType<PageId extends string = string>
  extends ViewPageType<PageId> {
  name: string;
}

export type SubMenuItemType = {
  id: string;
  label: string | ReactNode;
  path?: string;
  access?: AccessGuard;
};

export type MenuItemType<MenuKeys> = {
  id?: string;
  page?: MenuKeys;
  path?: string;
  icon?: ReactNode;
  type?: "menu" | "divider";
  auth?: boolean;
  children?: SubMenuItemType[];
  access?: AccessGuard;
};

export type FeatureEnabledFn<FeatureKey extends string> = (
  key: FeatureKey,
) => boolean;

export type FeatureDependencyMap<
  PageId extends string,
  FeatureKey extends string,
> = Partial<Record<PageId, FeatureKey>>;

export type BottomNavItemType<PageId extends string = string> = {
  id: string;
  page: PageId;
  to: string;
  icon: IconDefinition;
  position: "left" | "right";
};

export type RouteComponentRegistryType<
  RouteKey extends string = string,
  Component extends ElementType = ElementType,
> = Record<RouteKey, Component>;

export type RouteComponentKeyType<Registry extends RouteComponentRegistryType> =
  keyof Registry & string;

export function defineRouteComponents<
  const Registry extends RouteComponentRegistryType,
>(registry: Registry): Registry {
  return registry;
}

const joinRoutePath = (basePath: string, path: string): string => {
  if (!basePath) return path;
  if (!path) return basePath;

  const normalizedBase = basePath.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

const isFeatureDependencyEnabled = <
  PageId extends string,
  FeatureKey extends string,
>(
  page: PageId | undefined,
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: FeatureDependencyMap<PageId, FeatureKey>,
): boolean => {
  if (!page) return true;

  const dependency = dependencies[page];
  if (!dependency) return true;

  return isFeatureEnabled(dependency);
};

export function filterNavigationByFeatureFlags<
  Item extends { page?: string },
  FeatureKey extends string,
>(
  items: Item[],
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: FeatureDependencyMap<NonNullable<Item["page"]>, FeatureKey>,
): Item[] {
  return items.filter((item) =>
    isFeatureDependencyEnabled(item.page, isFeatureEnabled, dependencies),
  );
}

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
  dependencies: FeatureDependencyMap<NonNullable<Item["page"]>, FeatureKey>,
): Item[] {
  return filterNavigationByFeatureFlags(items, isFeatureEnabled, dependencies);
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

export function filterSitemapByFeatureFlags<
  PageId extends string,
  FeatureKey extends string,
>(
  routes: ViewPageType<PageId>[],
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: FeatureDependencyMap<PageId, FeatureKey>,
): ViewPageType<PageId>[] {
  return routes
    .filter((route) =>
      isFeatureDependencyEnabled(route.key, isFeatureEnabled, dependencies),
    )
    .map((route) => ({
      ...route,
      children: route.children
        ? filterSitemapByFeatureFlags(
            route.children,
            isFeatureEnabled,
            dependencies,
          )
        : undefined,
    }));
}

export function filterSitemapByAccess<PageId extends string>(
  routes: ViewPageType<PageId>[],
  account?: SessionAccountDto,
): ViewPageType<PageId>[] {
  return routes
    .filter((route) => {
      if (!route.access) return true;
      return route.access(account);
    })
    .map((route) => ({
      ...route,
      children: route.children
        ? filterSitemapByAccess(route.children, account)
        : undefined,
    }));
}

export function filterSitemap<PageId extends string, FeatureKey extends string>(
  routes: ViewPageType<PageId>[],
  isFeatureEnabled: FeatureEnabledFn<FeatureKey>,
  dependencies: FeatureDependencyMap<PageId, FeatureKey>,
  account?: SessionAccountDto,
): ViewPageType<PageId>[] {
  return filterSitemapByAccess(
    filterSitemapByFeatureFlags(routes, isFeatureEnabled, dependencies),
    account,
  );
}

export function createPathMap<PageId extends string>(
  routes: ViewPageType<PageId>[],
  basePath = "",
): Record<PageId, string> {
  const entries = routes.flatMap((route) => {
    const fullPath = joinRoutePath(basePath, route.path);
    const children = route.children
      ? Object.entries(createPathMap(route.children, fullPath))
      : [];

    return [[route.key, fullPath], ...children] as [PageId, string][];
  });

  return Object.fromEntries(entries) as Record<PageId, string>;
}

export function findPathInSitemap<PageId extends string>(
  routes: ViewPageType<PageId>[],
  targetPageId: PageId,
  basePath = "",
): string | undefined {
  for (const route of routes) {
    const fullPath = joinRoutePath(basePath, route.path);

    if (route.key === targetPageId) return fullPath;

    if (route.children) {
      const childPath = findPathInSitemap(
        route.children,
        targetPageId,
        fullPath,
      );

      if (childPath) return childPath;
    }
  }

  return undefined;
}

export function flattenSitemap<PageId extends string>(
  routes: ViewPageType<PageId>[],
  getName: (page: ViewPageType<PageId>) => string,
  basePath = "",
): NamedViewPageType<PageId>[] {
  return routes.flatMap((route) => {
    const fullPath = joinRoutePath(basePath, route.path);
    const { children, ...routeWithoutChildren } = route;
    const namedPage: NamedViewPageType<PageId> = {
      ...routeWithoutChildren,
      path: fullPath,
      name: getName(route),
    };

    const childPages = children
      ? flattenSitemap(children, getName, fullPath)
      : [];

    return [namedPage, ...childPages];
  });
}
