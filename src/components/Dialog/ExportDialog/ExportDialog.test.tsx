import { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExportDialog } from "./ExportDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
  classNames: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("components", () => ({
  Dialog: ({
    children,
    open,
    onSubmit,
  }: {
    children: ReactNode;
    open?: boolean;
    onSubmit?: (event?: React.BaseSyntheticEvent) => void | Promise<void>;
  }) =>
    open ? (
      <div role="dialog">
        {onSubmit ? <form onSubmit={onSubmit}>{children}</form> : children}
      </div>
    ) : null,
  DialogActions: ({
    onPrimaryClick,
    onCancel,
    primaryType = "submit",
    extraActions,
  }: {
    onPrimaryClick?: () => void;
    onCancel: () => void;
    primaryType?: "button" | "submit";
    extraActions?: Array<{
      id?: string | number;
      onClick?: () => void;
      children?: ReactNode;
    }>;
  }) => (
    <div>
      <button type={primaryType} onClick={onPrimaryClick}>
        ok
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
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

describe("ExportDialog", () => {
  it("renders extraFields between body and footer", () => {
    render(
      <ExportDialog
        open
        title="Export"
        handleClose={vi.fn()}
        handleSubmit={vi.fn()}
        extraFields={<div data-testid="extra-fields">date range</div>}
      >
        <p data-testid="body">choose options</p>
      </ExportDialog>,
    );

    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("extra-fields")).toBeInTheDocument();
  });

  it("invokes handleSubmit on primary action", () => {
    const handleSubmit = vi.fn();

    render(
      <ExportDialog
        open
        title="Export"
        handleClose={vi.fn()}
        handleSubmit={handleSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ok" }));
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it("renders and executes extra actions", () => {
    const onExtra = vi.fn();

    render(
      <ExportDialog
        open
        title="Export"
        handleClose={vi.fn()}
        handleSubmit={vi.fn()}
        extraActions={[
          {
            id: "secondary",
            type: "button",
            children: "Secondary",
            onClick: onExtra,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Secondary" }));
    expect(onExtra).toHaveBeenCalledOnce();
  });
});
