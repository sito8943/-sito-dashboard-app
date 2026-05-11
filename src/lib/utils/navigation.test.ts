import { describe, expect, it, vi } from "vitest";

import {
  filterMenuByFeatureFlags,
  normalizeMenuDividers,
  type MenuItemType,
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
});
