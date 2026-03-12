import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BaseEntityDto, ImportDto, ImportPreviewDto } from "lib";
import { useImportDialog } from "./useImportDialog";

const { mutateAsyncMock, invalidateQueriesMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
}));

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

vi.mock("hooks", () => ({
  useImportAction: () => ({
    action: () => ({
      id: "import",
    }),
  }),
}));

type ProductDto = BaseEntityDto & {
  name: string;
};

type ProductImportPreviewDto = ImportPreviewDto & {
  row: number;
};

describe("useImportDialog", () => {
  it("passes renderCustomPreview through in returned dialog props", () => {
    const mutationFn = vi.fn(
      async (payload: ImportDto<ProductImportPreviewDto>) => {
        void payload;
        return 1;
      },
    );
    const fileProcessor = vi.fn(
      async (file: File, options?: { override?: boolean }) => {
        void file;
        void options;
        return [] as ProductImportPreviewDto[];
      },
    );
    const renderCustomPreview = vi.fn(
      (items?: ProductImportPreviewDto[] | null) => {
        void items;
        return null;
      },
    );

    const { result } = renderHook(() =>
      useImportDialog<ProductDto, ProductImportPreviewDto>({
        queryKey: ["products"],
        entity: "products",
        mutationFn,
        fileProcessor,
        renderCustomPreview,
      }),
    );

    expect(result.current.renderCustomPreview).toBe(renderCustomPreview);
    expect(result.current.fileProcessor).toBe(fileProcessor);
  });
});
