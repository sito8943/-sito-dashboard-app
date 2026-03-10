import type { Meta, StoryObj } from "@storybook/react";
import { Clock } from "./Clock";

const meta = {
  title: "Components/Clock/Clock",
  component: Clock,
  tags: ["autodocs"],
} satisfies Meta<typeof Clock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const InNarrowContainer: Story = {
  render: () => (
    <div className="max-w-[220px] rounded border border-base/20 p-4">
      <Clock />
    </div>
  ),
};
