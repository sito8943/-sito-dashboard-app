import { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DrawerMenuProvider, useDrawerMenu } from "./DrawerMenuProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DrawerMenuProvider>{children}</DrawerMenuProvider>
);

describe("DrawerMenuProvider", () => {
  it("throws when useDrawerMenu is called outside provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useDrawerMenu<"users">())).toThrow(
      "DrawerMenuContext must be used within a Provider"
    );

    consoleErrorSpy.mockRestore();
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
