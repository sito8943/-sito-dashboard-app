import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ToTop } from "./ToTop";

const meta = {
  title: "Components/Buttons/ToTop",
  component: ToTop,
  tags: ["autodocs"],
} satisfies Meta<typeof ToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <div style={{ height: "1500px", padding: "1rem" }}>
      <p>Scroll down to see the ToTop button appear.</p>
      <div style={{ height: "1200px" }} />
      <ToTop {...args} />
    </div>
  ),
};

export const Customized: Story = {
  args: {
    threshold: 100,
    tooltip: "Back to top",
    scrollTop: 0,
    scrollLeft: 0,
    variant: "outlined",
    color: "secondary",
    className: "right-8 bottom-8",
  },
  render: (args) => (
    <div style={{ height: "1500px", padding: "1rem" }}>
      <p>Customized ToTop button.</p>
      <div style={{ height: "1200px" }} />
      <ToTop {...args} />
    </div>
  ),
};
