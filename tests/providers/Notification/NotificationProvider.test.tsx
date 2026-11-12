import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationEnumType } from "@/lib";
import { NotificationProvider } from "@/providers/Notification";
import { useNotification } from "@/providers/useNotification";
import type { NotificationContextType } from "@/providers/types";

// `useTranslation` throws outside `TranslationProvider`, like @sito/dashboard.
const translation = vi.hoisted(() => ({
  t: undefined as ((key: string) => string) | undefined,
}));

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => {
    if (!translation.t)
      throw new Error("translationContext must be used within a Provider");
    return { t: translation.t, language: "en" };
  },
}));

let api: NotificationContextType;

const Capture = () => {
  api = useNotification();
  return null;
};

const renderProvider = (
  props: Partial<Parameters<typeof NotificationProvider>[0]> = {},
) =>
  render(
    <NotificationProvider {...props}>
      <Capture />
    </NotificationProvider>,
  );

const toasts = () =>
  Array.from(
    document.body.querySelectorAll<HTMLElement>('[data-sito-ui="toast"]'),
  );

const openToasts = () =>
  toasts().filter((toast) => toast.dataset.state === "open");

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    translation.t = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws when useNotification is called outside the provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => render(<Capture />)).toThrow(
      "useNotification must be used within NotificationProvider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("renders a filled bottom-left viewport by default", () => {
    renderProvider();

    act(() => {
      api.showSuccessNotification({ message: "Saved" });
    });

    const viewport = document.body.querySelector(
      '[data-sito-ui="toast-viewport"]',
    );
    expect(viewport).toHaveAttribute("data-placement", "bottom-left");
    expect(viewport).toHaveAttribute("aria-label", "Notifications");
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(toasts()[0]).toHaveClass("sito-ui-toast--filled");
    expect(
      screen.getByRole("button", { name: "Close notification" }),
    ).toBeInTheDocument();
  });

  it.each([
    [NotificationEnumType.success, "success"],
    [NotificationEnumType.error, "error"],
    [NotificationEnumType.warning, "warning"],
    [NotificationEnumType.info, "info"],
    [undefined, "error"],
  ])("maps showNotification type %s to color %s", (type, color) => {
    renderProvider();

    act(() => {
      api.showNotification({ message: "Hi", type });
    });

    expect(toasts()[0]).toHaveAttribute("data-color", color);
  });

  it("uses the success and error colors for the shortcuts", () => {
    renderProvider();

    act(() => {
      api.showSuccessNotification({
        message: "Ok",
        type: NotificationEnumType.error,
      });
      api.showErrorNotification({ message: "Ko" });
    });

    expect(toasts().map((toast) => toast.dataset.color)).toEqual([
      "success",
      "error",
    ]);
  });

  it("stacks toasts instead of replacing them", () => {
    renderProvider();

    act(() => {
      api.showSuccessNotification({ message: "First" });
      api.showErrorNotification({ message: "Second" });
    });

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("shows one toast per stacked item and returns their ids", () => {
    renderProvider();

    let ids: number[] = [];
    act(() => {
      ids = api.showStackNotifications([
        { message: "One", type: NotificationEnumType.info },
        { message: "Two", type: NotificationEnumType.warning },
      ]);
    });

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(toasts().map((toast) => toast.dataset.color)).toEqual([
      "info",
      "warning",
    ]);
  });

  it("keeps at most 3 open toasts, closing the oldest first", () => {
    renderProvider();

    act(() => {
      ["A", "B", "C", "D"].forEach((message) =>
        api.showErrorNotification({ message }),
      );
    });

    expect(openToasts().map((toast) => toast.textContent)).toEqual([
      "B",
      "C",
      "D",
    ]);
  });

  it("auto-dismisses non-error toasts after 5000ms", () => {
    renderProvider();

    act(() => {
      api.showSuccessNotification({ message: "Saved" });
    });

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(openToasts()).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("keeps error toasts until they are dismissed", () => {
    renderProvider();

    act(() => {
      api.showErrorNotification({ message: "Failed" });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
  });

  it("removeNotification(id) dismisses only that toast", () => {
    renderProvider();

    let first = -1;
    act(() => {
      first = api.showErrorNotification({ message: "First" });
      api.showErrorNotification({ message: "Second" });
    });

    act(() => {
      api.removeNotification(first);
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("removeNotification() dismisses every toast", () => {
    renderProvider();

    act(() => {
      api.showErrorNotification({ message: "First" });
      api.showNotification({
        message: "Second",
        type: NotificationEnumType.warning,
      });
    });

    act(() => {
      api.removeNotification();
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(toasts()).toHaveLength(0);
  });

  it("keeps the deprecated notification field empty", () => {
    renderProvider();

    act(() => {
      api.showSuccessNotification({ message: "Saved" });
    });

    expect(api.notification).toEqual([]);
  });

  it("forwards placement, variant, max and duration", () => {
    renderProvider({
      placement: "top-right",
      variant: "accent",
      max: 1,
      duration: 1000,
    });

    act(() => {
      api.showSuccessNotification({ message: "One" });
      api.showSuccessNotification({ message: "Two" });
    });

    expect(
      document.body.querySelector('[data-sito-ui="toast-viewport"]'),
    ).toHaveAttribute("data-placement", "top-right");
    expect(openToasts()).toHaveLength(1);
    expect(openToasts()[0]).toHaveClass("sito-ui-toast--accent");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(toasts()).toHaveLength(0);
  });

  it("translates the labels inside a TranslationProvider", () => {
    translation.t = (key: string) => `t(${key})`;
    renderProvider();

    act(() => {
      api.showErrorNotification({ message: "Failed" });
    });

    expect(
      document.body.querySelector('[data-sito-ui="toast-viewport"]'),
    ).toHaveAttribute("aria-label", "t(_accessibility:labels.notifications)");
    expect(
      screen.getByRole("button", {
        name: "t(_accessibility:ariaLabels.closeNotification)",
      }),
    ).toBeInTheDocument();
  });

  it("prefers explicit label props", () => {
    renderProvider({ label: "Alerts", closeLabel: "Dismiss" });

    act(() => {
      api.showErrorNotification({ message: "Failed" });
    });

    expect(
      document.body.querySelector('[data-sito-ui="toast-viewport"]'),
    ).toHaveAttribute("aria-label", "Alerts");
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});
