import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { PrettyGrid } from "./PrettyGrid";
import type { BaseEntityDto } from "lib";

type Item = BaseEntityDto & { id: string; name: string; createdAt: Date; updatedAt: Date; deleted: boolean };

const sampleData: Item[] = Array.from({ length: 6 }).map((_, i) => ({
  id: String(i + 1),
  name: `Item ${i + 1}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  deleted: false,
}));

const meta = {
  title: "Components/PrettyGrid/PrettyGrid",
  component: PrettyGrid<Item>,
  tags: ["autodocs"],
  args: {
    data: sampleData,
    renderComponent: (item: Item) => (
      <div className="p-4 rounded-lg border border-base/20">
        <p className="font-semibold">{item.name}</p>
        <p className="text-xs opacity-70">id: {item.id}</p>
      </div>
    ),
  },
} satisfies Meta<typeof PrettyGrid<Item>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Empty: Story = {
  args: { data: [] },
};

