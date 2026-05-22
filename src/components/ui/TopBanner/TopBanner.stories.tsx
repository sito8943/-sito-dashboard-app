import type { Meta, StoryObj } from "@storybook/react";

import { TopBanner } from "./TopBanner";
import type { TopBannerColor } from "./types";

const meta = {
  title: "Components/TopBanner/TopBanner",
  component: TopBanner,
  tags: ["autodocs"],
  args: {
    visible: true,
    color: "default",
    children: "Generic top banner content",
  },
  argTypes: {
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "tertiary",
        "quaternary",
        "info",
        "success",
        "warning",
        "error",
      ] satisfies TopBannerColor[],
    },
  },
} satisfies Meta<typeof TopBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { color: "primary", children: "Primary brand notice" },
};

export const Secondary: Story = {
  args: { color: "secondary", children: "Secondary brand notice" },
};

export const Tertiary: Story = {
  args: { color: "tertiary", children: "Tertiary brand notice" },
};

export const Quaternary: Story = {
  args: { color: "quaternary", children: "Quaternary brand notice" },
};

export const Info: Story = {
  args: { color: "info", children: "Heads up — informational notice" },
};

export const Success: Story = {
  args: { color: "success", children: "Saved successfully" },
};

export const Warning: Story = {
  args: { color: "warning", children: "Degraded performance" },
};

export const Errored: Story = {
  args: { color: "error", children: "Something went wrong" },
};

export const Hidden: Story = {
  args: { visible: false },
};

const ALL_COLORS: TopBannerColor[] = [
  "default",
  "primary",
  "secondary",
  "tertiary",
  "quaternary",
  "info",
  "success",
  "warning",
  "error",
];

export const Palette: Story = {
  args: { children: "Palette preview" },
  render: () => (
    <div className="flex flex-col gap-2">
      {ALL_COLORS.map((c) => (
        <TopBanner key={c} color={c}>
          {c}
        </TopBanner>
      ))}
    </div>
  ),
};
