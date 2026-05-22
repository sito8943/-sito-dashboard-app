import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { ConfirmationDialog } from "components";
import { useFormDialogConfirmation } from "./useFormDialogConfirmation";

type ProductPayload = {
  id: number;
  name: string;
};

type ConfirmationDemoProps = {
  shouldFail?: boolean;
};

const buttonClassName =
  "rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700";

const secondaryButtonClassName =
  "rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50";

const delay = async () => {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 700);
  });
};

const ConfirmationDemo = ({ shouldFail = false }: ConfirmationDemoProps) => {
  const [lastPayload, setLastPayload] = useState<ProductPayload | null>(null);
  const [status, setStatus] = useState("No mutation run yet.");
  const [isMutating, setIsMutating] = useState(false);

  const confirmation = useFormDialogConfirmation<ProductPayload>({
    confirmation: {
      title: "Confirm product save",
      message: (
        <div className="space-y-2 text-sm text-gray-700">
          <p>The captured form payload will be submitted after confirming.</p>
          <p>
            Payload:{" "}
            <span className="font-mono">
              {lastPayload ? JSON.stringify(lastPayload) : "none"}
            </span>
          </p>
        </div>
      ),
      extraActions: [
        {
          id: "review-payload",
          type: "button",
          variant: "outlined",
          color: "secondary",
          children: "Review payload",
          onClick: () => {
            setStatus(
              lastPayload
                ? `Reviewing ${lastPayload.name} before submit.`
                : "No payload captured yet.",
            );
          },
        },
      ],
    },
    isMutating,
    onConfirmed: () => {
      setStatus("Mutation confirmed and dialog closed.");
    },
    runMutation: async (payload) => {
      setIsMutating(true);
      setStatus(`Submitting ${payload.name}...`);

      try {
        await delay();

        if (shouldFail) {
          setStatus("Mutation failed. Dialog stayed open for retry.");
          throw new Error("Storybook demo failure");
        }

        setStatus(`Submitted ${payload.name}.`);
      } finally {
        setIsMutating(false);
      }
    },
  });

  const capturePayload = (payload: ProductPayload) => {
    setLastPayload(payload);
    confirmation.capture(payload);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          className={buttonClassName}
          onClick={() => capturePayload({ id: 1, name: "Keyboard" })}
        >
          Capture Keyboard Payload
        </button>

        <button
          className={secondaryButtonClassName}
          onClick={() => capturePayload({ id: 2, name: "Monitor" })}
        >
          Capture Monitor Payload
        </button>
      </div>

      <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
        <p>Status: {status}</p>
        <p className="mt-1">
          Last payload: {lastPayload ? JSON.stringify(lastPayload) : "none"}
        </p>
        <p className="mt-1">
          Confirmation enabled: {confirmation.isEnabled ? "yes" : "no"}
        </p>
      </div>

      {confirmation.confirmationProps ? (
        <ConfirmationDialog {...confirmation.confirmationProps} />
      ) : null}
    </div>
  );
};

const meta = {
  title: "Hooks/Dialogs/useFormDialogConfirmation",
  component: ConfirmationDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmationDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    shouldFail: false,
  },
};

export const MutationError: Story = {
  args: {
    shouldFail: true,
  },
};
