import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "Components/Dropdown/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: false,
    onClose: () => {},
    children: <div className="p-4">Dropdown Content</div>,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-10">
        <button className="button outlined" onClick={() => setOpen(true)}>
          Open
        </button>
        <Dropdown open={open} onClose={() => setOpen(false)}>
          <div className="p-4">This is a dropdown content.</div>
        </Dropdown>
      </div>
    );
  },
};
