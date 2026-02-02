import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
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

