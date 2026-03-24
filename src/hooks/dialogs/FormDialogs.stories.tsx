import type { Meta, StoryObj } from "@storybook/react";
import { ReactNode, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Controller } from "react-hook-form";

import { FormDialog } from "components";
import { NotificationProvider } from "providers";
import { useFormDialog } from "./useFormDialog";
import { usePostDialog } from "./usePostDialog";
import { usePutDialog } from "./usePutDialog";

type FiltersForm = {
  term: string;
  minPrice: number;
};

type ProductForm = {
  name: string;
  id: number;
};

type ProductDto = {
  id: number;
  name: string;
};

const StoryProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 mb-3 text-sm text-gray-700">
    {label}
    {children}
  </label>
);

const inputClassName =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

const StateDialogDemo = () => {
  const [appliedFilters, setAppliedFilters] = useState<FiltersForm>({
    term: "",
    minPrice: 0,
  });

  const dialog = useFormDialog<never, never, never, FiltersForm, FiltersForm>({
    mode: "state",
    title: "Filters",
    defaultValues: { term: "", minPrice: 0 },
    reinitializeOnOpen: true,
    mapIn: () => appliedFilters,
    mapOut: (values) => values,
    onSubmit: (values) => {
      setAppliedFilters(values);
    },
  });

  return (
    <div className="max-w-md">
      <button
        className="rounded bg-blue-600 text-white px-3 py-2 text-sm"
        onClick={() => dialog.openDialog()}
      >
        Open State Dialog
      </button>

      <p className="mt-3 text-sm">Applied: {JSON.stringify(appliedFilters)}</p>

      <FormDialog<FiltersForm> {...dialog}>
        <Controller
          control={dialog.control}
          name="term"
          render={({ field }) => (
            <Field label="Term">
              <input className={inputClassName} {...field} />
            </Field>
          )}
        />

        <Controller
          control={dialog.control}
          name="minPrice"
          render={({ field }) => (
            <Field label="Min Price">
              <input
                className={inputClassName}
                type="number"
                value={field.value ?? 0}
                onChange={(event) =>
                  field.onChange(Number(event.target.value || 0))
                }
              />
            </Field>
          )}
        />
      </FormDialog>
    </div>
  );
};

const PostDialogDemo = () => {
  const [created, setCreated] = useState<ProductDto | null>(null);

  const dialog = usePostDialog<ProductDto, ProductDto, ProductForm>({
    title: "Create Product",
    defaultValues: { name: "" },
    mutationFn: async (payload) => ({
      ...payload,
      id: Math.floor(Math.random() * 1000),
    }),
    mapOut: (values) => values,
    onSuccess: (result) => setCreated(result),
  });

  return (
    <div className="max-w-md">
      <button
        className="rounded bg-emerald-600 text-white px-3 py-2 text-sm"
        onClick={() => dialog.openDialog()}
      >
        Open Post Dialog
      </button>

      <p className="mt-3 text-sm">
        Created: {created ? JSON.stringify(created) : "none"}
      </p>

      <FormDialog<ProductForm> {...dialog}>
        <Controller
          control={dialog.control}
          name="name"
          render={({ field }) => (
            <Field label="Name">
              <input className={inputClassName} {...field} />
            </Field>
          )}
        />
      </FormDialog>
    </div>
  );
};

const PutDialogDemo = () => {
  const [updated, setUpdated] = useState<ProductDto | null>(null);

  const dialog = usePutDialog<ProductDto, ProductDto, ProductDto, ProductForm>({
    title: "Edit Product",
    defaultValues: { name: "" },
    getFunction: async (id) => ({ id, name: `Product ${id}` }),
    dtoToForm: (dto) => (dto),
    mutationFn: async (payload) => payload,
    mapOut: (values, dto) => ({ id: dto?.id ?? 0, name: values.name }),
    onSuccess: (result) => setUpdated(result),
  });

  return (
    <div className="max-w-md">
      <button
        className="rounded bg-amber-600 text-white px-3 py-2 text-sm"
        onClick={() => dialog.openDialog(7)}
      >
        Open Put Dialog (id=7)
      </button>

      <p className="mt-3 text-sm">
        Updated: {updated ? JSON.stringify(updated) : "none"}
      </p>

      <FormDialog<ProductForm> {...dialog}>
        <Controller
          control={dialog.control}
          name="name"
          render={({ field }) => (
            <Field label="Name">
              <input className={inputClassName} {...field} />
            </Field>
          )}
        />
      </FormDialog>
    </div>
  );
};

const meta = {
  title: "Hooks/Dialogs/FormDialogs",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const StateMode: Story = {
  render: () => <StateDialogDemo />,
};

export const PostMode: Story = {
  render: () => <PostDialogDemo />,
};

export const PutMode: Story = {
  render: () => <PutDialogDemo />,
};
