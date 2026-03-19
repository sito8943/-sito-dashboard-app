import type { Meta, StoryObj } from "@storybook/react";
import React, { FormEvent, useRef, useState } from "react";
import { PasswordInput } from "./PasswordInput";
import { State } from "@sito/dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

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

export const CustomLabel: Story = {
  render: (args) => {
    const ref = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState("");
    return (
      <PasswordInput
        {...args}
        ref={ref}
        label={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-blue-500" />
            <span>
              Password <span className="text-xs text-gray-400">(required)</span>
            </span>
          </span>
        }
        placeholder="Enter your password"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    );
  },
};

export const CustomLabelWithState: Story = {
  render: (args) => {
    const ref = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState("");
    return (
      <PasswordInput
        {...args}
        ref={ref}
        label={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} className="text-green-500" />
            <span>Secure password</span>
          </span>
        }
        state={State.good}
        helperText="Strong password"
        placeholder="Enter a secure password"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    );
  },
};
