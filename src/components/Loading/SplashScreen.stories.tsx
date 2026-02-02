import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { SplashScreen } from "./SplashScreen";

const meta = {
  title: "Components/Loading/SplashScreen",
  component: SplashScreen,
  tags: ["autodocs"],
} satisfies Meta<typeof SplashScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

