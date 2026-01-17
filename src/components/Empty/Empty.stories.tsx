import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Empty } from "./Empty";
import type { BaseEntityDto } from "lib";

type Entity = BaseEntityDto & { id: string; createdAt: Date; updatedAt: Date; deleted: boolean };

const meta = {
  title: "Components/Empty/Empty",
  component: Empty,
  tags: ["autodocs"],
  args: {
    message: "Nothing here yet",
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
