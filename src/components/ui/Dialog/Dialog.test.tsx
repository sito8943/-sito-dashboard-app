import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Dialog } from "./Dialog";
import { getDialogHistoryEntryId } from "./utils";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

const setMobileViewport = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      matches,
      media,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", window.location.href);
});

describe("Dialog", () => {
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

  it("styles the close button without a generic error color class", () => {
    render(
      <Dialog open title="Confirm" handleClose={vi.fn()}>
        <p>Dialog body</p>
      </Dialog>,
    );

    const closeButton = screen.getByRole("button", {
      name: "_accessibility:ariaLabels.closeDialog",
    });

    expect(closeButton).toHaveClass("dialog-close-btn");
    expect(closeButton).not.toHaveAttribute("color");
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

  it("closes on browser back in a mobile viewport", () => {
    setMobileViewport(true);
    const handleClose = vi.fn();
    const previousHistoryState = { route: "home" };
    window.history.replaceState(previousHistoryState, "", window.location.href);

    const MobileDialog = () => {
      const [open, setOpen] = useState(true);

      return (
        <Dialog
          open={open}
          title="Confirm"
          handleClose={() => {
            handleClose();
            setOpen(false);
          }}
        >
          <p>Dialog body</p>
        </Dialog>
      );
    };

    render(<MobileDialog />);

    expect(getDialogHistoryEntryId(window.history.state)).not.toBeNull();

    window.history.replaceState(previousHistoryState, "", window.location.href);
    fireEvent.popState(window, { state: previousHistoryState });

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("keeps browser back unchanged outside a mobile viewport", () => {
    setMobileViewport(false);
    const handleClose = vi.fn();
    const previousHistoryState = { route: "home" };
    window.history.replaceState(previousHistoryState, "", window.location.href);

    render(
      <Dialog open title="Confirm" handleClose={handleClose}>
        <p>Dialog body</p>
      </Dialog>,
    );

    expect(window.history.state).toEqual(previousHistoryState);

    fireEvent.popState(window, { state: null });

    expect(handleClose).not.toHaveBeenCalled();
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

  it("focuses the dialog instead of the first input by default", () => {
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

      expect(screen.getByRole("dialog", { name: "Profile" })).toHaveFocus();
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
