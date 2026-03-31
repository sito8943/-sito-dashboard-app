import type { BottomNavigationItemType } from "./types";

/** Returns whether the current pathname matches the provided path. */
export const isPathActive = (pathname: string, path: string): boolean =>
  path === "/" ? pathname === "/" : pathname.startsWith(path);

/** Splits visible items into left and right navigation groups. */
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
