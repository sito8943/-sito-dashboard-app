import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { DeletableChip } from "./DeletableChip";

const meta = {
  title: "Components/Chip/DeletableChip",
  component: DeletableChip,
  tags: ["autodocs"],
  args: {
    text: "Removable",
    variant: "primary",
  },
} satisfies Meta<typeof DeletableChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    onDelete: () => {},
  },
  render: (args) => {
    const [visible, setVisible] = useState(true);
    if (!visible) return <p>Deleted</p>;
    return (
      <DeletableChip
        {...args}
        onDelete={() => setVisible(false)}
      />
    );
  },
};

