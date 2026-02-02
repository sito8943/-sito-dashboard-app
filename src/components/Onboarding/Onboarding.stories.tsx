import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Onboarding } from "./Onboarding";

const meta = {
  title: "Components/Onboarding/Onboarding",
  component: Onboarding,
  tags: ["autodocs"],
  args: {
    steps: ["welcome", "finish"],
  },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

