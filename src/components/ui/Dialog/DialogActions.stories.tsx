import type { Meta, StoryObj } from "@storybook/react";
import { DialogActions } from "./DialogActions";

const meta = {
  title: "Components/Dialog/DialogActions",
  component: DialogActions,
  tags: ["autodocs"],
  args: {
    primaryText: "Save",
    cancelText: "Cancel",
    onPrimaryClick: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof DialogActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
    disabled: true,
  },
};

export const AlignedEnd: Story = {
  args: {
    alignEnd: true,
  },
};

export const WithExtraActions: Story = {
  args: {
    extraActions: [
      {
        id: "save-draft-action",
        type: "button",
        variant: "outlined",
        color: "secondary",
        children: "Save draft",
        onClick: () => {},
      },
      {
        id: "discard-action",
        type: "button",
        variant: "text",
        children: "Discard",
        onClick: () => {},
      },
    ],
  },
};
