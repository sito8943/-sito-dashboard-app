import { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { usePutDialog } from "./usePutDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("providers", () => ({
  useNotification: () => ({
    showErrorNotification: vi.fn(),
    showStackNotifications: vi.fn(),
    showSuccessNotification: vi.fn(),
  }),
}));

type ProductDto = {
  id: number;
  name: string;
};

type ProductUpdateDto = {
  id?: number;
  name: string;
};

type ProductForm = {
  name: string;
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePutDialog", () => {
  it("loads by id and submits mapped update payload", async () => {
    const getFunction = vi.fn(async (id: number) => ({
      id,
      name: "Remote Product",
    }));

    const mutationFn = vi.fn(async (payload: ProductUpdateDto) => payload);

    const { result } = renderHook(
      () =>
        usePutDialog<
          ProductDto,
          ProductUpdateDto,
          ProductUpdateDto,
          ProductForm
        >({
          title: "Edit product",
          defaultValues: { name: "" },
          getFunction,
          mutationFn,
          dtoToForm: (dto) => ({ name: dto.name }),
          mapOut: (values, dto) => ({ id: dto?.id, name: values.name }),
          queryKey: ["products"],
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openDialog(7);
    });

    await waitFor(() => {
      expect(getFunction).toHaveBeenCalledWith(7);
      expect(result.current.getValues().name).toBe("Remote Product");
    });

    await act(async () => {
      await result.current.onSubmit({ name: "Updated" });
    });

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalledWith({ id: 7, name: "Updated" });
    });
  });
});
