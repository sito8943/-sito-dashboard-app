import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Chip } from "./Chip";
import { faTag } from "@fortawesome/free-solid-svg-icons";

const meta = {
  title: "Components/Chip/Chip",
  component: Chip,
  tags: ["autodocs"],
  args: {
    text: "Example",
    variant: "primary",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "none"],
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};


export const WithIcon: Story = {
  args: { icon: faTag },
};

