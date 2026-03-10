import { ChangeEvent, ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ImportPreviewDto } from "lib";
import { ImportDialog } from "./ImportDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
  FileInput: ({
    onChange,
    onClear,
    label,
  }: {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    label: string;
  }) => (
    <div>
      <label htmlFor="import-file">{label}</label>
      <input id="import-file" data-testid="file-input" type="file" onChange={onChange} />
      <button type="button" onClick={onClear}>
        clear
      </button>
    </div>
  ),
  Loading: () => <span data-testid="loading-spinner" />,
}));

vi.mock("components", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: ReactNode;
    open?: boolean;
  }) => (open ? <div role="dialog">{children}</div> : null),
  DialogActions: ({
    onPrimaryClick,
    onCancel,
  }: {
    onPrimaryClick?: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <button type="button" onClick={onPrimaryClick}>
        ok
      </button>
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

type PreviewRow = ImportPreviewDto & {
  row: number;
};

describe("ImportDialog", () => {
  it("renders custom preview with non-empty previewItems", async () => {
    const fileProcessor = vi
      .fn<(_: File, options?: { override?: boolean }) => Promise<PreviewRow[]>>()
      .mockResolvedValue([{ row: 1, existing: false }]);
    const renderCustomPreview = vi.fn((items?: PreviewRow[] | null) => (
      <div data-testid="custom-preview">{items?.length ?? "null"}</div>
    ));

    render(
      <ImportDialog<PreviewRow>
        open
        title="Import"
        handleClose={vi.fn()}
        handleSubmit={vi.fn()}
        fileProcessor={fileProcessor}
        renderCustomPreview={renderCustomPreview}
      />,
    );

    const file = new File(["row"], "import.csv", { type: "text/csv" });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("custom-preview")).toHaveTextContent("1");
    });

    expect(renderCustomPreview).toHaveBeenLastCalledWith([
      { row: 1, existing: false },
    ]);
    expect(screen.queryByText(/Preview:/i)).not.toBeInTheDocument();
  });

  it("renders custom preview for null and empty previewItems", async () => {
    const fileProcessor = vi
      .fn<(_: File, options?: { override?: boolean }) => Promise<PreviewRow[]>>()
      .mockResolvedValue([]);
    const renderCustomPreview = vi.fn((items?: PreviewRow[] | null) => (
      <div data-testid="custom-preview">{items ? items.length : "null"}</div>
    ));

    render(
      <ImportDialog<PreviewRow>
        open
        title="Import"
        handleClose={vi.fn()}
        handleSubmit={vi.fn()}
        fileProcessor={fileProcessor}
        renderCustomPreview={renderCustomPreview}
      />,
    );

    expect(screen.getByTestId("custom-preview")).toHaveTextContent("null");
    expect(renderCustomPreview).toHaveBeenCalledWith(null);

    const file = new File(["row"], "import.csv", { type: "text/csv" });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("custom-preview")).toHaveTextContent("0");
    });

    expect(renderCustomPreview).toHaveBeenLastCalledWith([]);
  });
});
