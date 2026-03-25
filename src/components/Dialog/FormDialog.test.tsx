import { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { FormDialog } from "./FormDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("./Dialog", () => ({
  Dialog: ({
    children,
    title,
  }: {
    children: ReactNode;
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
    onCancel,
    isLoading,
    disabled,
    primaryType = "submit",
    extraActions,
  }: {
    primaryText: string;
    cancelText: string;
    onCancel: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    primaryType?: "button" | "submit";
    extraActions?: Array<{
      id?: string | number;
      type?: "button" | "submit" | "reset";
      onClick?: () => void;
      children?: ReactNode;
      disabled?: boolean;
    }>;
  }) => (
    <div>
      <button type={primaryType} disabled={disabled}>
        {isLoading && <span data-testid="loading" />}
        {primaryText}
      </button>
      {(extraActions ?? []).map((action, index) => (
        <button
          key={`${action.id ?? `extra-${index}`}`}
          type={action.type ?? "button"}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.children}
        </button>
      ))}
      <button type="button" onClick={onCancel} disabled={disabled}>
        {cancelText}
      </button>
    </div>
  ),
}));

type FormValues = {
  description: string;
};

const FormDialogHarness = ({
  onSubmit,
  extraActions = [],
}: {
  onSubmit: (values: FormValues) => void | Promise<void>;
  extraActions?: Array<{
    id?: string | number;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    children?: ReactNode;
  }>;
}) => {
  const { handleSubmit, register } = useForm<FormValues>({
    defaultValues: { description: "" },
  });

  return (
    <FormDialog<FormValues>
      open
      title="Edit Description"
      handleClose={vi.fn()}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      extraActions={extraActions}
    >
      <input aria-label="Description" {...register("description")} />
    </FormDialog>
  );
};

describe("FormDialog", () => {
  it("submits the form when submit button is clicked", async () => {
    const onSubmit = vi.fn();

    render(<FormDialogHarness onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "_accessibility:buttons.submit",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("renders and executes extra actions", () => {
    const onSaveDraft = vi.fn();

    render(
      <FormDialogHarness
        onSubmit={vi.fn()}
        extraActions={[
          {
            id: "save-draft-action",
            type: "button",
            children: "Save draft",
            onClick: onSaveDraft,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(onSaveDraft).toHaveBeenCalledOnce();
  });
});
