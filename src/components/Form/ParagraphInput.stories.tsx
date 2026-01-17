import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ParagraphInput } from "./ParagraphInput";
import { State } from "@sito/dashboard";

const meta = {
  title: "Components/Form/ParagraphInput",
  component: ParagraphInput,
  tags: ["autodocs"],
  args: {
    label: "Description",
    placeholder: "Type something...",
    required: false,
    state: State.default,
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: [State.default, "error", "good"],
    },
  },
} satisfies Meta<typeof ParagraphInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [value, setValue] = useState("Lorem ipsum dolor sit amet...");
    return (
      <div className="max-w-xl">
        <ParagraphInput
          {...args}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      </div>
    );
  },
};

export const ErrorState: Story = {
  args: { state: State.error, helperText: "This field is required" },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-xl">
        <ParagraphInput
          {...args}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      </div>
    );
  },
};
