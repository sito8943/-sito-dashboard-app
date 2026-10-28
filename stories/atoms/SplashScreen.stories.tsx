import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { SplashScreen } from "@/components/atoms/Loading/SplashScreen";

const meta = {
  title: "Atoms/Loading/SplashScreen",
  component: SplashScreen,
  tags: ["autodocs"],
} satisfies Meta<typeof SplashScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const CustomSizeAndColor: Story = {
  args: {
    size: 56,
    color: "stroke-primary",
    className: "min-w-[56px]",
    containerClassName: "w-14 h-14",
  },
};
