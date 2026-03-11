import { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotificationProvider, useNotification } from "./NotificationProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe("NotificationProvider", () => {
  it("throws when useNotification is called outside provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useNotification())).toThrow(
      "NotificationContext must be used within a Provider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("provides notification actions when wrapped with provider", () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showSuccessNotification({ message: "Done" });
    });

    expect(result.current.notification).toHaveLength(1);
    expect(result.current.notification[0]?.message).toBe("Done");
  });
});
