import type { Meta, StoryObj } from "@storybook/react";
import { ReactNode, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Button, ImportDialog } from "components";
import { NotificationProvider } from "providers";
import { useImportDialog } from "./useImportDialog";

type TransactionPreview = {
  existing: boolean;
  amount: number;
  description: string;
};

type TransactionDto = {
  id: number;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

type ExtraImport = {
  useCurrentAccount: boolean;
  note: string;
};

const StoryProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  );
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const ExtraFieldsHookStory = () => {
  const [submittedPayload, setSubmittedPayload] = useState<
    | (ExtraImport & {
        items: TransactionPreview[];
        override: boolean;
      })
    | null
  >(null);

  const dialog = useImportDialog<
    TransactionDto,
    TransactionPreview,
    ExtraImport
  >({
    queryKey: ["transactions"],
    entity: "transactions",
    fileProcessor: async (_file, options) => {
      await sleep(400);
      return [
        {
          existing: true,
          amount: 1200,
          description: "Subscription",
        },
        {
          existing: !!options?.override,
          amount: 89,
          description: "Coffee",
        },
      ];
    },
    mutationFn: async (payload) => {
      setSubmittedPayload(payload);
      return payload.items.length;
    },
    defaultExtra: { useCurrentAccount: true, note: "" },
    renderExtraFields: ({ values, setValue }) => (
      <div className="mt-4 grid gap-2 rounded border border-base/20 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.useCurrentAccount}
            onChange={(e) => setValue("useCurrentAccount", e.target.checked)}
          />
          <span>Use current account</span>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Note</span>
          <input
            type="text"
            value={values.note}
            onChange={(e) => setValue("note", e.target.value)}
            className="rounded border border-base/30 px-2 py-1"
          />
        </label>
      </div>
    ),
  });

  return (
    <div className="grid gap-3 p-4">
      <Button onClick={() => dialog.action().onClick?.()}>
        Open import dialog
      </Button>
      <ImportDialog<TransactionPreview>
        {...dialog}
        title="Import transactions"
      />
      {submittedPayload && (
        <pre className="rounded bg-base/10 p-3 text-xs">
          {JSON.stringify(submittedPayload, null, 2)}
        </pre>
      )}
    </div>
  );
};

const meta = {
  title: "Hooks/Dialogs/ImportDialogs",
  component: ExtraFieldsHookStory,
  decorators: [
    (Story) => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ExtraFieldsHookStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithExtraFields: Story = {};
