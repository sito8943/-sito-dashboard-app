import { describe, expect, it, vi } from "vitest";

import {
  createPathMap,
  defineRouteComponents,
  filterNavigationByFeatureFlags,
  filterMenuByFeatureFlags,
  filterSitemap,
  findPathInSitemap,
  flattenSitemap,
  normalizeMenuDividers,
  type MenuItemType,
  type ViewPageType,
} from "./navigation";

type Pages = "home" | "reports" | "billing";
type Features = "reportsFeature" | "billingFeature";

describe("navigation utils", () => {
  it("filters menu items by feature-flag dependencies", () => {
    const items: Array<MenuItemType<Pages>> = [
      { page: "home", path: "/" },
      { page: "reports", path: "/reports" },
      { page: "billing", path: "/billing" },
    ];

    const isFeatureEnabled = vi.fn((feature: Features) => {
      return feature === "reportsFeature";
    });

    const dependencies = {
      reports: "reportsFeature",
      billing: "billingFeature",
    } satisfies Partial<Record<Pages, Features>>;

    const filtered = filterMenuByFeatureFlags(
      items,
      isFeatureEnabled,
      dependencies,
    );

    expect(filtered).toEqual([
      { page: "home", path: "/" },
      { page: "reports", path: "/reports" },
    ]);
    expect(isFeatureEnabled).toHaveBeenCalledTimes(2);
  });

  it("keeps items with no dependency mapping", () => {
    const items: Array<MenuItemType<Pages>> = [
      { page: "home", path: "/" },
      { page: "reports", path: "/reports" },
    ];

    const isFeatureEnabled = vi.fn(() => false);

    const filtered = filterMenuByFeatureFlags(items, isFeatureEnabled, {});

    expect(filtered).toEqual(items);
    expect(isFeatureEnabled).not.toHaveBeenCalled();
  });

  it("filters generic navigation items by feature flags", () => {
    const items = [
      { id: "home", page: "home" },
      { id: "reports", page: "reports" },
    ];

    const filtered = filterNavigationByFeatureFlags(
      items,
      (feature: Features) => feature === "reportsFeature",
      {
        reports: "reportsFeature",
      },
    );

    expect(filtered).toEqual(items);
  });

  it("normalizes leading, trailing and duplicate dividers", () => {
    const items: Array<{ id: string; type?: "menu" | "divider" }> = [
      { id: "d-1", type: "divider" },
      { id: "home", type: "menu" },
      { id: "d-2", type: "divider" },
      { id: "d-3", type: "divider" },
      { id: "reports", type: "menu" },
      { id: "d-4", type: "divider" },
    ];

    const normalized = normalizeMenuDividers(items);

    expect(normalized).toEqual([
      { id: "home", type: "menu" },
      { id: "d-2", type: "divider" },
      { id: "reports", type: "menu" },
    ]);
  });

  it("returns empty when menu contains only dividers", () => {
    const items: Array<{ type?: "menu" | "divider" }> = [
      { type: "divider" },
      { type: "divider" },
    ];

    expect(normalizeMenuDividers(items)).toEqual([]);
  });

  it("filters sitemap entries by feature flags and access guards", () => {
    const routes: ViewPageType<Pages>[] = [
      { key: "home", path: "/" },
      {
        key: "reports",
        path: "/reports",
        children: [{ key: "billing", path: "billing" }],
      },
      {
        key: "billing",
        path: "/billing",
        access: () => false,
      },
    ];

    const filtered = filterSitemap(
      routes,
      (feature: Features) => feature === "reportsFeature",
      {
        reports: "reportsFeature",
        billing: "billingFeature",
      },
    );

    expect(filtered).toEqual([
      { key: "home", path: "/", children: undefined },
      {
        key: "reports",
        path: "/reports",
        children: [],
      },
    ]);
  });

  it("creates path maps, finds paths and flattens nested sitemap entries", () => {
    const routes: ViewPageType<Pages>[] = [
      {
        key: "home",
        path: "/",
        children: [{ key: "reports", path: "reports" }],
      },
      { key: "billing", path: "/billing" },
    ];

    expect(createPathMap(routes)).toEqual({
      home: "/",
      reports: "/reports",
      billing: "/billing",
    });
    expect(findPathInSitemap(routes, "reports")).toBe("/reports");
    expect(flattenSitemap(routes, (page) => page.key)).toEqual([
      {
        key: "home",
        path: "/",
        name: "home",
      },
      {
        key: "reports",
        path: "/reports",
        name: "reports",
      },
      {
        key: "billing",
        path: "/billing",
        name: "billing",
      },
    ]);
  });

  it("preserves route component registry keys", () => {
    const Home = () => null;
    const NotFound = () => null;

    const registry = defineRouteComponents({
      Home,
      NotFound,
    });

    expect(Object.keys(registry)).toEqual(["Home", "NotFound"]);
    expect(registry.Home).toBe(Home);
  });
});
