import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { ImportPreviewDto } from "lib";
import { ImportDialog } from "./ImportDialog";
import type { ImportDialogPropsType } from "./types";

type ImportDialogStoryProps = {
  title?: string;
  helperText?: string;
  fileProcessor?: ImportDialogPropsType<ImportPreviewDto>["fileProcessor"];
  renderCustomPreview?: ImportDialogPropsType<ImportPreviewDto>["renderCustomPreview"];
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
  fileProcessor,
  renderCustomPreview,
}: ImportDialogStoryProps) => {
  const [open, setOpen] = useState(true);

  return (
    <ImportDialog<ImportPreviewDto>
      title={title}
      open={open}
      handleClose={() => setOpen(false)}
      handleSubmit={() => setOpen(false)}
      fileProcessor={fileProcessor}
      renderCustomPreview={renderCustomPreview}
    >
      <p className="mt-2">{helperText}</p>
    </ImportDialog>
  );
};

const meta = {
  title: "Components/Dialog/ImportDialog",
  component: ImportDialogStory,
  tags: ["autodocs"],
  args: {
    title: "Import Data",
    helperText: "Choose a file and confirm.",
  },
} satisfies Meta<typeof ImportDialogStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithAsyncPreview: Story = {
  args: {
    fileProcessor: successFileProcessor,
    helperText: "Upload any file to see loading, preview and override behavior.",
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
            <li key={index}>Row {index + 1}: {item.existing ? "existing" : "new"}</li>
          ))}
        </ul>
      </div>
    ),
  },
};
