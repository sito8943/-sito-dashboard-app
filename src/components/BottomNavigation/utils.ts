import type { BottomNavigationItemType } from "./types";

export const isPathActive = (pathname: string, path: string): boolean =>
  path === "/" ? pathname === "/" : pathname.startsWith(path);

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
