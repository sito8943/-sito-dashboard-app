import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Loading } from "./Loading";

const meta = {
  title: "Components/Loading/Loading",
  component: Loading,
  tags: ["autodocs"],
  args: {
    containerClassName: "flex items-center justify-center h-40",
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

