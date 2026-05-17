import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BaseEntityDto } from "lib";
import { useExportDialog } from "./useExportDialog";

const { mutateAsyncMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
}));

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: ({
    mutationFn,
  }: {
    mutationFn: (data: unknown) => unknown;
  }) => ({
    mutateAsync: async (data: unknown) => {
      mutateAsyncMock(data);
      return mutationFn(data);
    },
    isPending: false,
  }),
}));

vi.mock("hooks", () => ({
  useExportAction: ({ onClick }: { onClick: () => void }) => ({
    action: () => ({
      id: "export",
      onClick,
    }),
  }),
}));

type ProductDto = BaseEntityDto & {
  name: string;
};

type ExportExtra = {
  format: "csv" | "xlsx";
  includeArchived: boolean;
};

describe("useExportDialog", () => {
  it("opens the dialog when the action is triggered", () => {
    const { result } = renderHook(() =>
      useExportDialog<ProductDto, ExportExtra>({
        entity: "products",
        defaultExtra: { format: "csv", includeArchived: false },
        mutationFn: async () => undefined,
      }),
    );

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.action().onClick?.();
    });

    expect(result.current.open).toBe(true);
  });

  it("invokes mutationFn with merged extra values and resets state", async () => {
    mutateAsyncMock.mockClear();
    const mutationFn = vi.fn(async (payload: ExportExtra) => {
      void payload;
      return undefined;
    });

    const { result } = renderHook(() =>
      useExportDialog<ProductDto, ExportExtra>({
        entity: "products",
        defaultExtra: { format: "csv", includeArchived: false },
        mutationFn,
      }),
    );

    act(() => {
      result.current.action().onClick?.();
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      format: "csv",
      includeArchived: false,
    });
    await waitFor(() => expect(result.current.open).toBe(false));
  });
});
