import { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { useFormDialog } from "./useFormDialog";

type FiltersForm = {
  term: string;
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
        useFormDialog<FiltersForm, { q: string }>({
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
        useFormDialog<FiltersForm>({
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
    });

    await waitFor(() => {
      expect(result.current.open).toBe(false);
    });

    act(() => {
      currentFilters = { term: "second" };
      result.current.openDialog();
    });

    await waitFor(() => {
      expect(result.current.getValues().term).toBe("second");
    });
  });

  it("calls onError when mapOut fails in submit/apply", async () => {
    const mapError = new Error("map failed");
    const onError = vi.fn(async () => undefined);

    const { result } = renderHook(
      () =>
        useFormDialog<FiltersForm, { q: string }>({
          mode: "state",
          title: "Filters",
          defaultValues: { term: "" },
          mapOut: () => {
            throw mapError;
          },
          onSubmit: async () => undefined,
          onApply: async () => undefined,
          onError,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openDialog();
      result.current.setValue("term", "milk");
    });

    await act(async () => {
      await expect(result.current.onSubmit({ term: "milk" })).rejects.toBe(
        mapError,
      );
    });

    await act(async () => {
      await expect(result.current.onApply()).rejects.toBe(mapError);
    });

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenNthCalledWith(
      1,
      mapError,
      expect.objectContaining({
        phase: "submit",
        values: { term: "milk" },
      }),
    );
    expect(onError).toHaveBeenNthCalledWith(
      2,
      mapError,
      expect.objectContaining({
        phase: "apply",
        values: { term: "milk" },
      }),
    );
  });

  it("calls onError when submit/apply/clear handlers fail and rethrows", async () => {
    const submitError = new Error("submit failed");
    const applyError = new Error("apply failed");
    const clearError = new Error("clear failed");
    const onError = vi.fn(async () => undefined);

    const { result } = renderHook(
      () =>
        useFormDialog<FiltersForm>({
          mode: "state",
          title: "Filters",
          defaultValues: { term: "" },
          onSubmit: async () => {
            throw submitError;
          },
          onApply: async () => {
            throw applyError;
          },
          onClear: async () => {
            throw clearError;
          },
          onError,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openDialog();
      result.current.setValue("term", "milk");
    });

    await act(async () => {
      await expect(result.current.onSubmit({ term: "milk" })).rejects.toBe(
        submitError,
      );
    });

    await act(async () => {
      await expect(result.current.onApply()).rejects.toBe(applyError);
    });

    await act(async () => {
      await expect(result.current.onClear()).rejects.toBe(clearError);
    });

    expect(onError).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenNthCalledWith(
      1,
      submitError,
      expect.objectContaining({
        phase: "submit",
        id: undefined,
        values: { term: "milk" },
        close: expect.any(Function),
      }),
    );
    expect(onError).toHaveBeenNthCalledWith(
      2,
      applyError,
      expect.objectContaining({
        phase: "apply",
        id: undefined,
        values: { term: "milk" },
        close: expect.any(Function),
      }),
    );
    expect(onError).toHaveBeenNthCalledWith(
      3,
      clearError,
      expect.objectContaining({
        phase: "clear",
        id: undefined,
        values: { term: "milk" },
        close: expect.any(Function),
      }),
    );
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
