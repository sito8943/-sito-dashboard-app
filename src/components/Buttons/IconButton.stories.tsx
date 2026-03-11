import type { Meta, StoryObj } from "@storybook/react";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AppIconButton } from "./IconButton";

const meta = {
  title: "Components/Buttons/IconButton",
  component: AppIconButton,
  tags: ["autodocs"],
  args: {
    icon: faPlus,
    type: "button",
    name: "Add",
    "aria-label": "Add",
  },
} satisfies Meta<typeof AppIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Outlined: Story = {
  args: {
    icon: faPen,
    variant: "outlined",
    color: "secondary",
    name: "Edit",
    "aria-label": "Edit",
  },
};

export const Disabled: Story = {
  args: {
    icon: faTrash,
    color: "error",
    disabled: true,
    name: "Delete",
    "aria-label": "Delete",
  },
};
