import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Dialog } from "./Dialog";
import { resetBodyScrollLockForTests } from "./bodyScrollLock";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("components", () => ({
  AppIconButton: ({
    onClick,
    ...props
  }: {
    onClick?: () => void;
    [key: string]: unknown;
  }) => <button type="button" onClick={onClick} {...props} />,
}));

describe("Dialog", () => {
  beforeEach(() => {
    resetBodyScrollLockForTests();
  });

  it("renders via portal and restores previous body overflow on unmount", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = render(
      <Dialog open title="Confirm" handleClose={vi.fn()}>
        <p>Dialog body</p>
      </Dialog>,
    );

    expect(screen.getByText("Dialog body")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("calls handleClose on Escape when open", () => {
    const handleClose = vi.fn();

    render(
      <Dialog open title="Confirm" handleClose={handleClose}>
        <p>Dialog body</p>
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("does not close when backdrop is clicked by default", () => {
    const handleClose = vi.fn();

    render(
      <Dialog open title="Confirm" handleClose={handleClose}>
        <p>Dialog body</p>
      </Dialog>,
    );

    fireEvent.click(screen.getByText("Dialog body"));
    expect(handleClose).not.toHaveBeenCalled();

    const backdrop = document.body.querySelector(".dialog-backdrop");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) fireEvent.click(backdrop);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it("closes when backdrop is clicked and closeOnBackdropClick is enabled", () => {
    const handleClose = vi.fn();

    render(
      <Dialog
        open
        title="Confirm"
        handleClose={handleClose}
        closeOnBackdropClick
      >
        <p>Dialog body</p>
      </Dialog>,
    );

    const backdrop = document.body.querySelector(".dialog-backdrop");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("applies mobile full screen class only when enabled", () => {
    const { rerender } = render(
      <Dialog open title="Confirm" handleClose={vi.fn()}>
        <p>Dialog body</p>
      </Dialog>,
    );

    const dialog = document.body.querySelector(".dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveClass("dialog-mobile-full-screen");
    expect(dialog).toHaveClass("dialog-framed");

    rerender(
      <Dialog open title="Confirm" handleClose={vi.fn()} mobileFullScreen>
        <p>Dialog body</p>
      </Dialog>,
    );

    const fullscreenDialog = document.body.querySelector(".dialog");
    expect(fullscreenDialog).toBeInTheDocument();
    expect(fullscreenDialog).toHaveClass("dialog-mobile-full-screen");
    expect(fullscreenDialog).not.toHaveClass("dialog-framed");
  });

  it("prevents native form navigation and delegates submit", () => {
    const onSubmit = vi.fn((event?: { defaultPrevented?: boolean }) => {
      expect(event?.defaultPrevented).toBe(true);
    });

    render(
      <Dialog open title="Confirm" handleClose={vi.fn()} onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not focus the first input by default", () => {
    const previousFocus = document.createElement("button");
    previousFocus.type = "button";
    previousFocus.textContent = "Previously focused";
    document.body.appendChild(previousFocus);
    previousFocus.focus();

    try {
      render(
        <Dialog open title="Profile" handleClose={vi.fn()}>
          <input aria-label="Name" />
        </Dialog>,
      );

      expect(previousFocus).toHaveFocus();
      expect(screen.getByRole("textbox", { name: "Name" })).not.toHaveFocus();
    } finally {
      previousFocus.remove();
    }
  });

  it("focuses the first enabled field when initialFocus is first-input", () => {
    render(
      <Dialog
        open
        title="Profile"
        handleClose={vi.fn()}
        initialFocus="first-input"
      >
        <div>
          <input aria-label="Hidden field" type="hidden" />
          <input aria-label="Disabled name" disabled />
          <textarea aria-label="Description" />
          <input aria-label="Name" />
        </div>
      </Dialog>,
    );

    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Name" })).not.toHaveFocus();
  });

  it("focuses the submit button when initialFocus is submit", () => {
    render(
      <Dialog
        open
        title="Confirm"
        handleClose={vi.fn()}
        onSubmit={vi.fn()}
        initialFocus="submit"
      >
        <button type="submit">Submit</button>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Submit" })).toHaveFocus();
  });
});
