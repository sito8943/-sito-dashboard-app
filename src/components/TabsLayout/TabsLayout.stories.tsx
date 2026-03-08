import type { Meta, StoryObj } from "@storybook/react";
import { TabsLayout } from "./TabsLayout";

const meta = {
  title: "Components/TabsLayout/TabsLayout",
  component: TabsLayout,
  tags: ["autodocs"],
  args: {
    tabs: [
      { id: 1, label: "First", content: <div className="p-4">First tab content</div> },
      { id: 2, label: "Second", content: <div className="p-4">Second tab content</div> },
    ],
  },
} satisfies Meta<typeof TabsLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithoutLinks: Story = {
  args: {
    useLinks: false,
    tabs: [
      { id: 1, label: "Overview", content: <div className="p-4">Overview content</div> },
      { id: 2, label: "Activity", content: <div className="p-4">Activity content</div> },
      { id: 3, label: "Settings", content: <div className="p-4">Settings content</div> },
    ],
  },
};

export const WithCustomTabButton: Story = {
  args: {
    useLinks: false,
    tabButtonProps: {
      variant: "outlined",
      color: "secondary",
      className: "min-w-[120px]",
    },
    tabs: [
      { id: 1, label: "Users", content: <div className="p-4">Users tab content</div> },
      { id: 2, label: "Roles", content: <div className="p-4">Roles tab content</div> },
    ],
  },
};
