import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tab } from "./Tab";

const meta = {
  title: "Components/TabsLayout/Tab",
  component: Tab,
  tags: ["autodocs"],
  args: {
    id: "overview",
    to: "/overview",
    active: true,
    useLinks: true,
    onClick: () => {},
    children: "Overview",
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsLink: Story = {};

export const AsButton: Story = {
  args: {
    useLinks: false,
    active: false,
    tabButtonProps: {
      variant: "outlined",
      color: "secondary",
    },
  },
};

export const ToggleExample: Story = {
  render: () => {
    const [tab, setTab] = useState<"overview" | "activity">("overview");

    return (
      <div className="flex gap-2">
        <Tab
          id="overview"
          to="/overview"
          useLinks={false}
          active={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          Overview
        </Tab>
        <Tab
          id="activity"
          to="/activity"
          useLinks={false}
          active={tab === "activity"}
          onClick={() => setTab("activity")}
        >
          Activity
        </Tab>
      </div>
    );
  },
};
