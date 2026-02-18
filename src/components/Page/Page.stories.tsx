import type { Meta, StoryObj } from "@storybook/react";
import { Page } from "./Page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

const meta = {
  title: "Components/Page/Page",
  component: Page,
  tags: ["autodocs"],
  args: {
    title: "Users",
    showBackButton: true,
    isAnimated: true,
    children: (
      <div className="rounded-lg border border-base/20 p-4">
        <p className="text-sm opacity-80">Page content area</p>
        <p className="mt-2 text-xs opacity-60">
          Place tables, forms, and detail content here.
        </p>
      </div>
    ),
    actions: [
      {
        id: "edit",
        tooltip: "Edit selected",
        icon: <FontAwesomeIcon icon={faPen} />,
        onClick: () => alert("Edit clicked"),
      },
      {
        id: "delete",
        tooltip: "Delete selected",
        icon: <FontAwesomeIcon icon={faTrash} />,
        onClick: () => alert("Delete clicked"),
      },
    ],
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithAddAndFilters: Story = {
  args: {
    addOptions: {
      tooltip: "Create user",
      onClick: () => alert("Create clicked"),
    },
    filterOptions: {
      tooltip: "Open filters",
      onClick: () => alert("Filters clicked"),
    },
    queryKey: ["users"],
  },
};
