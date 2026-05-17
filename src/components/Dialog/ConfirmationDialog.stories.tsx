import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, type ReactNode } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import type { ConfirmationDialogPropsType } from "./types";

type StoryArgs = Omit<
  ConfirmationDialogPropsType,
  "open" | "handleClose" | "handleSubmit" | "children"
> & {
  body?: ReactNode;
};

const Wrapper = (args: StoryArgs) => {
  const { body, ...rest } = args;
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        className="button submit primary mb-4"
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </button>
      <ConfirmationDialog
        {...rest}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={() => setOpen(false)}
      >
        {body}
      </ConfirmationDialog>
    </div>
  );
};

const meta = {
  title: "Components/Dialog/ConfirmationDialog",
  component: Wrapper,
  tags: ["autodocs"],
  args: {
    title: "Confirm Delete",
    mobileFullScreen: false,
  },
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    body: <p>Are you sure you want to delete this item?</p>,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    body: <p>Please wait while we process your request.</p>,
  },
};

export const WithExtraActions: Story = {
  args: {
    body: <p>Use extra actions for secondary workflows before confirming.</p>,
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
};

export const MobileFullScreen: Story = {
  args: {
    mobileFullScreen: true,
    body: <p>Full screen on mobile viewport.</p>,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
