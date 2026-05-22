import type { ButtonHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PwaUpdateDialog } from "./PwaUpdateDialog";

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

vi.mock("@sito/dashboard", () => ({
  Button: ({ children, type = "button", ...props }: MockButtonProps) => (
    <button type={type} {...props}>
      {children}
    </button>
  ),
  useTranslation: () => ({ t: (key: string) => key }),
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("../../ui/Dialog", () => ({
  Dialog: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    handleClose: () => void;
  }) =>
    open ? (
      <div data-testid="dialog">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

describe("PwaUpdateDialog", () => {
  const defaultProps = {
    open: true,
    onDismiss: vi.fn(),
    onUpdate: vi.fn(),
    title: "Update available",
    description: "A new version is ready.",
    dismissLabel: "Later",
    updateLabel: "Update",
  };

  it("renders title, description, and both buttons when open", () => {
    render(<PwaUpdateDialog {...defaultProps} />);

    expect(screen.getByText("Update available")).toBeTruthy();
    expect(screen.getByText("A new version is ready.")).toBeTruthy();
    expect(screen.getByText("Later")).toBeTruthy();
    expect(screen.getByText("Update")).toBeTruthy();
  });

  it("does not render content when open is false", () => {
    render(<PwaUpdateDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId("dialog")).toBeNull();
  });

  it("fires onDismiss when the dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(<PwaUpdateDialog {...defaultProps} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText("Later"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("fires onUpdate when the update button is clicked", () => {
    const onUpdate = vi.fn();
    render(<PwaUpdateDialog {...defaultProps} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText("Update"));

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
