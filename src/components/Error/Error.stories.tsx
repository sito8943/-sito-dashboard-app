import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Error as ErrorComponent } from "./Error";

const meta = {
  title: "Components/Error/Error",
  component: ErrorComponent,
  tags: ["autodocs"],
  args: {
    error: new Error("Something went wrong"),
  },
} satisfies Meta<typeof ErrorComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

