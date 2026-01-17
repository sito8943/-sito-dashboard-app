import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";
import { faPlus, faTrash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const meta = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: {
    icon: faPlus,
    children: "",
  },
  argTypes: {
    variant: { control: { type: "select" }, options: ["text", "outlined", "submit"] },
    color: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "error", "warning", "success", "info"],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: faPlus, variant: "text", color: "default" },
};

export const Primary: Story = {
  args: { icon: faArrowLeft, color: "primary" },
};

export const DangerOutlined: Story = {
  args: { icon: faTrash, color: "error", variant: "outlined" },
};

