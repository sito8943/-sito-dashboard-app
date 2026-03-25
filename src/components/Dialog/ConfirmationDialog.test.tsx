import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "./ConfirmationDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Loading: () => <span data-testid="loading" />,
}));

// Mock Dialog and DialogActions to avoid portal + deep dependency chain
vi.mock("./Dialog", () => ({
  Dialog: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div role="dialog">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock("./DialogActions", () => ({
  DialogActions: ({
    primaryText,
    cancelText,
    onPrimaryClick,
    onCancel,
    isLoading,
    disabled,
    primaryAriaLabel,
    cancelAriaLabel,
    extraActions,
  }: {
    primaryText: string;
    cancelText: string;
    onPrimaryClick?: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    primaryAriaLabel?: string;
    cancelAriaLabel?: string;
    extraActions?: Array<{
      id?: string | number;
      onClick?: () => void;
      children?: React.ReactNode;
    }>;
  }) => (
    <div>
      <button
        onClick={onPrimaryClick}
        disabled={disabled}
        aria-label={primaryAriaLabel}
      >
        {isLoading && <span data-testid="loading" />}
        {primaryText}
      </button>
      {(extraActions ?? []).map((action, index) => (
        <button
          key={`${action.id ?? `extra-${index}`}`}
          type="button"
          onClick={action.onClick}
        >
          {action.children}
        </button>
      ))}
      <button
        onClick={onCancel}
        disabled={disabled}
        aria-label={cancelAriaLabel}
      >
        {cancelText}
      </button>
    </div>
  ),
}));

const baseProps = {
  open: true,
  title: "Confirm delete",
  handleClose: vi.fn(),
  handleSubmit: vi.fn(),
};

describe("ConfirmationDialog", () => {
  it("renders the dialog title", () => {
    render(<ConfirmationDialog {...baseProps} />);
    expect(screen.getByText("Confirm delete")).toBeInTheDocument();
  });

  it("renders children inside the dialog", () => {
    render(
      <ConfirmationDialog {...baseProps}>
        <p>Are you sure?</p>
      </ConfirmationDialog>,
    );
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls handleSubmit when the OK button is clicked", () => {
    const handleSubmit = vi.fn();
    render(<ConfirmationDialog {...baseProps} handleSubmit={handleSubmit} />);
    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.ok" }),
    );
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it("calls handleClose when the Cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(<ConfirmationDialog {...baseProps} handleClose={handleClose} />);
    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.cancel" }),
    );
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("disables both buttons when isLoading is true", () => {
    render(<ConfirmationDialog {...baseProps} isLoading />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("shows the loading indicator when isLoading is true", () => {
    render(<ConfirmationDialog {...baseProps} isLoading />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders and executes extra actions", () => {
    const onPreview = vi.fn();

    render(
      <ConfirmationDialog
        {...baseProps}
        extraActions={[
          {
            id: "preview-action",
            type: "button",
            children: "Preview",
            onClick: onPreview,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));

    expect(onPreview).toHaveBeenCalledOnce();
  });
});
