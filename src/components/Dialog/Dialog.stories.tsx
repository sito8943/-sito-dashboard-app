import type { Meta, StoryObj } from "@storybook/react";
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
    mobileFullScreen: false,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: false,
    handleClose: () => {},
  },
  render: (args) => {
    const [open, setOpen] = useState(!!args.open);
    return (
      <div>
        <button
          className="button submit primary mb-4"
          onClick={() => setOpen(true)}
        >
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

export const MobileFullScreen: Story = {
  args: {
    open: false,
    handleClose: () => {},
    mobileFullScreen: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: Basic.render,
};

export const CustomPosition: Story = {
  args: {
    open: false,
    handleClose: () => {},
    title: "Dialog with custom position",
    containerClassName: "!items-start !justify-end p-6",
    className: "!w-[28rem] !max-w-[calc(100vw-3rem)]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses `containerClassName` to move the dialog container to the top-right corner.",
      },
    },
  },
  render: Basic.render,
};
