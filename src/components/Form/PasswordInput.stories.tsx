import type { Meta, StoryObj } from "@storybook/react";
import React, { useRef } from "react";
import { PasswordInput } from "./PasswordInput";

const meta = {
  title: "Components/Form/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    label: "Password",
    placeholder: "Enter your password",
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    value: "",
  },
  render: (args) => {
    const ref = useRef<HTMLInputElement | null>(null);
    return <PasswordInput {...args} ref={ref} />;
  },
};

