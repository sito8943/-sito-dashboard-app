import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";

const meta = {
  title: "Components/Navbar/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    openDrawer: { action: "openDrawer" },
  },
  args: {
    openDrawer: () => {},
    showClock: true,
    showSearch: true,
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithoutClock: Story = {
  args: {
    showClock: false,
  },
};

export const WithoutSearch: Story = {
  args: {
    showSearch: false,
  },
};
