import { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { usePostDialog } from "./usePostDialog";

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

type ProductForm = {
  name: string;
};

type ProductDto = {
  name: string;
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePostDialog", () => {
  it("submits creation without get by id", async () => {
    const mutationFn = vi.fn(async (payload: ProductDto) => payload);

    const { result } = renderHook(
      () =>
        usePostDialog<ProductDto, ProductDto, ProductForm>({
          title: "Create product",
          defaultValues: { name: "" },
          mutationFn,
          formToDto: (values) => ({ name: values.name }),
          queryKey: ["products"],
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.onSubmit({ name: "Cheese" });
    });

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalledWith({ name: "Cheese" });
    });
  });
});
