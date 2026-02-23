import type { Meta, StoryObj } from "@storybook/react";
import React, { FormEvent, useRef, useState } from "react";
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

    const [value, setValue] = useState("");
    return (
      <PasswordInput
        {...args}
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    );
  },
};
