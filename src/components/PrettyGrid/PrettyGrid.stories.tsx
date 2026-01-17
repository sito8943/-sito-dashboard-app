import type { Meta, StoryObj } from "@storybook/react";
import { PrettyGrid } from "./PrettyGrid";
import type { BaseEntityDto } from "lib";

interface Item extends BaseEntityDto {
  name: string;
};

const sampleData: Item[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  deleted: false,
}));

const meta = {
  title: "Components/PrettyGrid/PrettyGrid",
  component: PrettyGrid,
  tags: ["autodocs"],
  args: {
    data: sampleData,
    renderComponent: (item: BaseEntityDto) => (
      <div className="p-4 rounded-lg border border-base/20">
        <p className="font-semibold">{(item as Item).name}</p>
        <p className="text-xs opacity-70">id: {item.id}</p>
      </div>
    ),
  },
} satisfies Meta<typeof PrettyGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Empty: Story = {
  args: { data: [] },
};
