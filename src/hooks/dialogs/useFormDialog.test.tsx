import { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { useFormDialog } from "./useFormDialog";

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

type FiltersForm = {
  term: string;
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

describe("useFormDialog", () => {
  it("supports state mode submit/apply/clear with mapped values", async () => {
    const onSubmit = vi.fn(async () => undefined);
    const onApply = vi.fn(async () => undefined);
    const onClear = vi.fn(async () => undefined);

    const { result } = renderHook(
      () =>
        useFormDialog<never, never, never, FiltersForm, { q: string }>({
          mode: "state",
          title: "Filters",
          defaultValues: { term: "" },
          closeOnSubmit: false,
          mapOut: (values) => ({ q: values.term }),
          onSubmit,
          onApply,
          onClear,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openDialog();
      result.current.setValue("term", "abc");
    });

    await act(async () => {
      await result.current.onApply();
    });

    expect(onApply).toHaveBeenCalledWith(
      { q: "abc" },
      expect.objectContaining({ id: undefined, values: { term: "abc" } }),
    );

    await act(async () => {
      await result.current.onSubmit({ term: "zzz" });
    });

    expect(onSubmit).toHaveBeenCalledWith(
      { q: "zzz" },
      expect.objectContaining({ id: undefined, values: { term: "zzz" } }),
    );

    await act(async () => {
      await result.current.onClear();
    });

    expect(onClear).toHaveBeenCalled();
    expect(result.current.getValues().term).toBe("");
  });

  it("reinitializes values on open when reinitializeOnOpen is enabled", async () => {
    let currentFilters: FiltersForm = { term: "first" };

    const { result } = renderHook(
      () =>
        useFormDialog<never, never, never, FiltersForm>({
          mode: "state",
          title: "Filters",
          defaultValues: { term: "" },
          reinitializeOnOpen: true,
          mapIn: () => currentFilters,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openDialog();
    });

    await waitFor(() => {
      expect(result.current.getValues().term).toBe("first");
    });

    act(() => {
      result.current.handleClose();
      currentFilters = { term: "second" };
      result.current.openDialog();
    });

    await waitFor(() => {
      expect(result.current.getValues().term).toBe("second");
    });
  });

  it("keeps legacy api behavior for mutation-driven dialog", async () => {
    const mutationFn = vi.fn(
      async (payload: { name: string }) => payload.name.length,
    );

    const { result } = renderHook(
      () =>
        useFormDialog<
          ProductForm,
          { name: string },
          number,
          ProductForm,
          ProductForm
        >({
          title: "Product",
          defaultValues: { name: "" },
          mutationFn,
          queryKey: ["products"],
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.onSubmit({ name: "milk" });
    });

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalledWith({ name: "milk" });
    });
  });
});
