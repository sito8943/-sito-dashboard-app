import { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePostDialog } from "@/hooks/dialogs/usePostDialog";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const { showSuccessNotification } = vi.hoisted(() => ({
  showSuccessNotification: vi.fn(),
}));

vi.mock("@/providers", () => ({
  useNotification: () => ({
    showErrorNotification: vi.fn(),
    showStackNotifications: vi.fn(),
    showSuccessNotification,
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
  beforeEach(() => {
    showSuccessNotification.mockClear();
  });

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

  it("shows onSuccessMessage after a successful submit", async () => {
    const mutationFn = vi.fn(async (payload: ProductDto) => payload);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        usePostDialog<ProductDto, ProductDto, ProductForm>({
          title: "Create product",
          defaultValues: { name: "" },
          mutationFn,
          onSuccess,
          onSuccessMessage: "Saved",
          queryKey: ["products"],
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.onSubmit({ name: "Cheese" });
    });

    expect(onSuccess).toHaveBeenCalledWith({ name: "Cheese" });
    expect(showSuccessNotification).toHaveBeenCalledWith({ message: "Saved" });
  });

  it("does not show onSuccessMessage when the mutation fails", async () => {
    const mutationFn = vi.fn(async () => {
      throw new Error("boom");
    });

    const { result } = renderHook(
      () =>
        usePostDialog<ProductDto, ProductDto, ProductForm>({
          title: "Create product",
          defaultValues: { name: "" },
          mutationFn,
          onError: vi.fn(),
          onSuccessMessage: "Saved",
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      try {
        await result.current.onSubmit({ name: "Cheese" });
      } catch {
        // the dialog rethrows after notifying the error
      }
    });

    expect(showSuccessNotification).not.toHaveBeenCalled();
  });
});
