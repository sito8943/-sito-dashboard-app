import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ReactNode } from "react";

import { ExportDialog } from "./ExportDialog";
import type { ExportDialogPropsType } from "./types";

type ExportDialogStoryProps = {
  title?: string;
  helperText?: string;
  mobileFullScreen?: boolean;
  extraFields?: ReactNode;
  extraActions?: ExportDialogPropsType["extraActions"];
};

const ExportDialogStory = ({
  title = "Export Data",
  helperText = "Configure the export and confirm.",
  mobileFullScreen = false,
  extraFields,
  extraActions = [],
}: ExportDialogStoryProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        className="button submit primary mb-4"
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </button>
      <ExportDialog
        title={title}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
        mobileFullScreen={mobileFullScreen}
        extraFields={extraFields}
        extraActions={extraActions}
      >
        <p className="mt-2">{helperText}</p>
      </ExportDialog>
    </div>
  );
};

const ExtraFieldsDemo = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");

  return (
    <div className="mt-4 grid gap-2 rounded border border-base/20 p-3">
      <label className="grid gap-1 text-sm">
        <span>From</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded border border-base/30 px-2 py-1"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>To</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded border border-base/30 px-2 py-1"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Format</span>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "csv" | "xlsx")}
          className="rounded border border-base/30 px-2 py-1"
        >
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
      </label>
    </div>
  );
};

const meta = {
  title: "Components/Dialog/ExportDialog",
  component: ExportDialogStory,
  tags: ["autodocs"],
  args: {
    title: "Export Data",
    helperText: "Configure the export and confirm.",
    mobileFullScreen: false,
  },
} satisfies Meta<typeof ExportDialogStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithExtraFields: Story = {
  args: {
    extraFields: <ExtraFieldsDemo />,
    helperText:
      "Use extraFields to inject custom inputs (date range, format) above DialogActions.",
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
