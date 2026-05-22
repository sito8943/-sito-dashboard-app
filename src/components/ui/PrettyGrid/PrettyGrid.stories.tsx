import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { PrettyGrid } from "./PrettyGrid";
import type { BaseEntityDto } from "lib";

interface Item extends BaseEntityDto {
  name: string;
}

const sampleData: Item[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
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

export const Loading: Story = {
  args: {
    loading: true,
  },
};

const createItem = (id: number): Item => ({
  id,
  name: `Item ${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

export const InfiniteScroll: Story = {
  render: () => {
    const [items, setItems] = useState<Item[]>(
      Array.from({ length: 6 }).map((_, i) => createItem(i + 1)),
    );
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
      setLoadingMore(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      setItems((prev) => {
        const nextStart = prev.length + 1;
        const next = Array.from({ length: 3 }).map((_, i) =>
          createItem(nextStart + i),
        );
        const merged = [...prev, ...next];
        if (merged.length >= 12) setHasMore(false);
        return merged;
      });

      setLoadingMore(false);
    };

    return (
      <PrettyGrid<Item>
        data={items}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        loadMoreComponent={
          <p className="text-sm opacity-70 py-2">Loading more…</p>
        }
        renderComponent={(item) => (
          <div className="p-4 rounded-lg border border-base/20">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs opacity-70">id: {item.id}</p>
          </div>
        )}
      />
    );
  },
};
