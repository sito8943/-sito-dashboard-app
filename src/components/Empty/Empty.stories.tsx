import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Empty } from "./Empty";
import type { BaseEntityDto } from "lib";
import { faBoxOpen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Entity = BaseEntityDto & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

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

export const CustomMessage: Story = {
  args: {
    message: "No records match the selected filters.",
  },
};

export const WithAction: Story = {
  args: {
    action: {
      id: "create",
      tooltip: "Create item",
      icon: <FontAwesomeIcon icon={faPlus} />,
      onClick: () => {},
    },
  },
};

export const WithIcon: Story = {
  args: {
    iconProps: {
      icon: faBoxOpen,
      className: "text-4xl text-primary mb-2",
    },
  },
};
