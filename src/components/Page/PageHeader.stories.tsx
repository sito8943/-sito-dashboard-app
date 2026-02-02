import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PageHeader } from "./PageHeader";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BaseEntityDto } from "lib";

type Entity = BaseEntityDto & { id: string; createdAt: Date; updatedAt: Date; deleted: boolean };

const meta = {
  title: "Components/Page/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Users",
    showBackButton: true,
    actions: [
      {
        id: "create",
        tooltip: "Create",
        icon: <FontAwesomeIcon icon={faPlus} />,
        onClick: () => alert("Create clicked"),
      },
      {
        id: "delete",
        tooltip: "Delete",
        icon: <FontAwesomeIcon icon={faTrash} />,
        onClick: () => alert("Delete clicked"),
      },
    ],
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
