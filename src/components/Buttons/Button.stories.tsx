import type { Meta, StoryObj } from "storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Click me",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "outlined", "contained"],
    },
    color: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "danger"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: "text", color: "default" },
};

export const Outlined: Story = {
  args: { variant: "outlined", color: "default", children: "Save" },
};

export const Contained: Story = {
  args: { variant: "contained", color: "secondary", children: "Submit" },
};

