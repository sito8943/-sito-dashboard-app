import type { BottomNavigationItemType } from "./types";
import { APP_ROUTES } from "lib";

/**
 * Returns whether the current pathname matches the provided path.
 * @param pathname - Current location pathname.
 * @param path - Target path to evaluate.
 * @returns True when the path is active.
 */
export const isPathActive = (pathname: string, path: string): boolean =>
  path === APP_ROUTES.ROOT
    ? pathname === APP_ROUTES.ROOT
    : pathname.startsWith(path);

/**
 * Splits visible items into left and right navigation groups.
 * @param items - Bottom navigation items.
 * @returns Visible items split by side.
 */
export const splitBottomNavigationItems = <TId extends string>(
  items: BottomNavigationItemType<TId>[],
): {
  leftItems: BottomNavigationItemType<TId>[];
  rightItems: BottomNavigationItemType<TId>[];
} => {
  const visibleItems = items.filter((item) => !item.hidden);

  return {
    leftItems: visibleItems.filter((item) => item.position !== "right"),
    rightItems: visibleItems.filter((item) => item.position === "right"),
  };
};
