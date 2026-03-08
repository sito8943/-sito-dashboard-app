import { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DrawerMenuProvider, useDrawerMenu } from "./DrawerMenuProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DrawerMenuProvider>{children}</DrawerMenuProvider>
);

describe("DrawerMenuProvider", () => {
  it("returns safe defaults when useDrawerMenu is called outside provider", () => {
    const { result } = renderHook(() => useDrawerMenu<"users">());

    expect(result.current.dynamicItems).toEqual({});
    expect(() =>
      result.current.addChildItem("users", { id: "1", label: "Item 1" })
    ).not.toThrow();
    expect(() => result.current.removeChildItem("users", 0)).not.toThrow();
    expect(() => result.current.clearDynamicItems("users")).not.toThrow();
  });

  it("manages dynamic drawer items when wrapped with provider", () => {
    const { result } = renderHook(() => useDrawerMenu<"users">(), { wrapper });

    act(() => {
      result.current.addChildItem("users", {
        id: "item-1",
        label: "Child 1",
        path: "/users/1",
      });
    });

    expect(result.current.dynamicItems.users).toHaveLength(1);
    expect(result.current.dynamicItems.users?.[0]?.id).toBe("item-1");
  });
});
