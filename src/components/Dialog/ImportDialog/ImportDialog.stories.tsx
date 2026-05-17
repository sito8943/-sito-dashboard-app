import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ReactNode } from "react";
import { ImportDialog } from "./ImportDialog";
import type { ImportDialogPropsType } from "./types";
import { ImportPreviewDto } from "../../../lib";

type ImportDialogStoryProps = {
  title?: string;
  helperText?: string;
  mobileFullScreen?: boolean;
  fileProcessor?: ImportDialogPropsType<ImportPreviewDto>["fileProcessor"];
  renderCustomPreview?: ImportDialogPropsType<ImportPreviewDto>["renderCustomPreview"];
  extraActions?: ImportDialogPropsType<ImportPreviewDto>["extraActions"];
  extraFields?: ReactNode;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const successFileProcessor: NonNullable<
  ImportDialogPropsType<ImportPreviewDto>["fileProcessor"]
> = async (_file, options) => {
  await sleep(700);
  return [{ existing: true }, { existing: !!options?.override }];
};

const failingFileProcessor: NonNullable<
  ImportDialogPropsType<ImportPreviewDto>["fileProcessor"]
> = async () => {
  await sleep(700);
  throw new Error("Invalid CSV format");
};

const ImportDialogStory = ({
  title = "Import Data",
  helperText = "Choose a file and confirm.",
  mobileFullScreen = false,
  fileProcessor,
  renderCustomPreview,
  extraActions = [],
  extraFields,
}: ImportDialogStoryProps) => {
  const [open, setOpen] = useState(true);

  return (
    <ImportDialog<ImportPreviewDto>
      title={title}
      open={open}
      handleClose={() => setOpen(false)}
      handleSubmit={() => setOpen(false)}
      mobileFullScreen={mobileFullScreen}
      fileProcessor={fileProcessor}
      renderCustomPreview={renderCustomPreview}
      extraActions={extraActions}
      extraFields={extraFields}
    >
      <p className="mt-2">{helperText}</p>
    </ImportDialog>
  );
};

const ExtraFieldsDemo = () => {
  const [useCurrentAccount, setUseCurrentAccount] = useState(true);
  const [note, setNote] = useState("");

  return (
    <div className="mt-4 grid gap-2 rounded border border-base/20 p-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useCurrentAccount}
          onChange={(e) => setUseCurrentAccount(e.target.checked)}
        />
        <span>Use current account</span>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Note</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded border border-base/30 px-2 py-1"
        />
      </label>
      <p className="text-xs opacity-70">
        Selected: {useCurrentAccount ? "current account" : "none"} - note:{" "}
        {note || "(empty)"}
      </p>
    </div>
  );
};

const meta = {
  title: "Components/Dialog/ImportDialog",
  component: ImportDialogStory,
  tags: ["autodocs"],
  args: {
    title: "Import Data",
    helperText: "Choose a file and confirm.",
    mobileFullScreen: false,
  },
} satisfies Meta<typeof ImportDialogStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithAsyncPreview: Story = {
  args: {
    fileProcessor: successFileProcessor,
    helperText:
      "Upload any file to see loading, preview and override behavior.",
  },
};

export const WithParseError: Story = {
  args: {
    fileProcessor: failingFileProcessor,
    helperText: "Upload a file to trigger parse error state.",
  },
};

export const WithCustomPreview: Story = {
  args: {
    fileProcessor: successFileProcessor,
    renderCustomPreview: (items) => (
      <div className="mt-4 rounded border border-base/20 p-3">
        <p className="mb-2 text-sm font-semibold">
          Custom Preview ({items?.length ?? 0})
        </p>
        <ul className="grid gap-1 text-sm">
          {(items ?? []).map((item, index) => (
            <li key={index}>
              Row {index + 1}: {item.existing ? "existing" : "new"}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
};

export const WithExtraActions: Story = {
  args: {
    extraActions: [
      {
        id: "download-template-action",
        type: "button",
        variant: "outlined",
        color: "secondary",
        children: "Download template",
        onClick: () => {},
      },
      {
        id: "clear-selection-action",
        type: "button",
        variant: "text",
        children: "Clear",
        onClick: () => {},
      },
    ],
    helperText: "Use extra actions for template/help flows during import.",
  },
};

export const WithExtraFields: Story = {
  args: {
    fileProcessor: successFileProcessor,
    extraFields: <ExtraFieldsDemo />,
    helperText:
      "Use extraFields to inject custom inputs (e.g. account checkbox) above DialogActions.",
  },
};

export const MobileFullScreen: Story = {
  args: {
    mobileFullScreen: true,
    helperText: "Full screen on mobile viewport.",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
