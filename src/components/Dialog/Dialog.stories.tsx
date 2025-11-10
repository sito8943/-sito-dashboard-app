import type { Meta, StoryObj } from "storybook/react";
import React, { useState } from "react";
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

const meta = {
  title: "Components/Dialog/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    title: "Example Dialog",
    open: true,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [open, setOpen] = useState(!!args.open);
    return (
      <div>
        <button className="button contained primary mb-4" onClick={() => setOpen(true)}>
          Open Dialog
        </button>
        <Dialog {...args} open={open} handleClose={() => setOpen(false)}>
          <div className="p-4">
            <p className="mb-4">This is a basic dialog content.</p>
            <DialogActions
              primaryText="OK"
              cancelText="Cancel"
              onPrimaryClick={() => setOpen(false)}
              onCancel={() => setOpen(false)}
              alignEnd
            />
          </div>
        </Dialog>
      </div>
    );
  },
};

