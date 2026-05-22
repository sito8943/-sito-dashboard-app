import type { Meta, StoryObj } from "@storybook/react";

import { OfflineBanner } from "./OfflineBanner";

const meta = {
  title: "Components/OfflineBanner/OfflineBanner",
  component: OfflineBanner,
  tags: ["autodocs"],
  args: {
    isOnline: false,
  },
} satisfies Meta<typeof OfflineBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = {};

export const CustomMessage: Story = {
  args: {
    message: "No internet connection. Some actions are disabled.",
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "uppercase tracking-wide",
    message: "Offline — read-only",
  },
};

export const HiddenWhenOnline: Story = {
  args: {
    isOnline: true,
  },
};
