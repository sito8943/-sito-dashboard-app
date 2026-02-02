import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ImportDialog } from "./ImportDialog";

const meta = {
  title: "Components/Dialog/ImportDialog",
  component: ImportDialog,
  tags: ["autodocs"],
  args: {
    title: "Import Data",
  },
} satisfies Meta<typeof ImportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: true,
    handleClose: () => {},
    handleSubmit: () => {},
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <ImportDialog
        {...args}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
      >
        <p className="mt-2">Choose a file and confirm.</p>
      </ImportDialog>
    );
  },
};

