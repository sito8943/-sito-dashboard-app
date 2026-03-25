import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";

const meta = {
  title: "Components/Dialog/ConfirmationDialog",
  component: ConfirmationDialog,
  tags: ["autodocs"],
  args: {
    title: "Confirm Delete",
  },
} satisfies Meta<typeof ConfirmationDialog>;

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
      <ConfirmationDialog
        {...args}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
      >
        <p>Are you sure you want to delete this item?</p>
      </ConfirmationDialog>
    );
  },
};

export const Loading: Story = {
  args: {
    open: true,
    isLoading: true,
    handleClose: () => {},
    handleSubmit: () => {},
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmationDialog
        {...args}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
      >
        <p>Please wait while we process your request.</p>
      </ConfirmationDialog>
    );
  },
};

export const WithExtraActions: Story = {
  args: {
    open: true,
    handleClose: () => {},
    handleSubmit: () => {},
    extraActions: [
      {
        id: "preview-action",
        type: "button",
        variant: "outlined",
        color: "secondary",
        children: "Preview",
        onClick: () => {},
      },
      {
        id: "archive-action",
        type: "button",
        variant: "text",
        children: "Archive",
        onClick: () => {},
      },
    ],
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmationDialog
        {...args}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
      >
        <p>Use extra actions for secondary workflows before confirming.</p>
      </ConfirmationDialog>
    );
  },
};
