import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Notification } from "./Notification";
import { NotificationProvider, useNotification } from "providers";
import { NotificationEnumType } from "lib";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("../../ui/Buttons", () => ({
  AppIconButton: ({
    onClick,
    className,
    disabled,
    type,
    name,
    "aria-label": ariaLabel,
  }: {
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    name?: string;
    "aria-label"?: string;
  }) => (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={className}
      disabled={disabled}
      name={name}
      aria-label={ariaLabel}
    />
  ),
}));

const NotificationHarness = () => {
  const { showSuccessNotification, showStackNotifications } = useNotification();

  return (
    <>
      <button
        type="button"
        onClick={() => showSuccessNotification({ message: "Saved" })}
      >
        Show one
      </button>
      <button
        type="button"
        onClick={() =>
          showStackNotifications([
            { message: "First", type: NotificationEnumType.info },
            { message: "Second", type: NotificationEnumType.warning },
          ])
        }
      >
        Show stack
      </button>
      <Notification />
    </>
  );
};

describe("Notification", () => {
  it("renders in portal and closes with Escape", () => {
    vi.useFakeTimers();

    render(
      <NotificationProvider>
        <NotificationHarness />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show one" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("closes stacked notifications on outside click", () => {
    vi.useFakeTimers();

    render(
      <NotificationProvider>
        <NotificationHarness />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show stack" }));
    act(() => {
      vi.runAllTimers();
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();

    fireEvent.click(window);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
  });
});
