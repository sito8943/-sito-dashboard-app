import { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DialogActions } from "./DialogActions";

vi.mock("@sito/dashboard", () => ({
  Loading: () => <span data-testid="loading-indicator" />,
}));

vi.mock("components", () => ({
  Button: ({
    children,
    type,
    onClick,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children?: ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

describe("DialogActions", () => {
  it("renders and executes extra actions", () => {
    const onPrimaryClick = vi.fn();
    const onCancel = vi.fn();
    const onSaveDraft = vi.fn();

    render(
      <DialogActions
        primaryText="Save"
        cancelText="Cancel"
        onPrimaryClick={onPrimaryClick}
        onCancel={onCancel}
        extraActions={[
          {
            id: "save-draft",
            type: "button",
            children: "Save draft",
            onClick: onSaveDraft,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onPrimaryClick).toHaveBeenCalledOnce();
    expect(onSaveDraft).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
