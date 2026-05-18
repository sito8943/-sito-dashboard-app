import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ParagraphInput } from "./ParagraphInput";
import { State } from "@sito/dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

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
      options: [State.default, State.error, State.good],
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

export const GoodState: Story = {
  args: { state: State.good, helperText: "Looks good" },
  render: (args) => {
    const [value, setValue] = useState("Valid description");
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

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled text",
  },
};

export const Uncontrolled: Story = {
  args: {
    defaultValue: "Initial uncontrolled value",
    value: undefined,
  },
  render: (args) => (
    <div className="max-w-xl">
      <ParagraphInput {...args} />
    </div>
  ),
};

export const CustomLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-xl">
        <ParagraphInput
          {...args}
          label={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faAlignLeft} className="text-blue-500" />
              <span>
                Description{" "}
                <span className="text-xs text-gray-400">(optional)</span>
              </span>
            </span>
          }
          placeholder="Write a detailed description..."
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      </div>
    );
  },
};

export const CustomLabelWithHelperText: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-xl">
        <ParagraphInput
          {...args}
          label={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleInfo} className="text-amber-500" />
              <span>Notes</span>
            </span>
          }
          state={State.error}
          helperText="This field is required"
          placeholder="Add your notes here..."
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      </div>
    );
  },
};
