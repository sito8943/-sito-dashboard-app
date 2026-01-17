import type { Meta, StoryObj } from "@storybook/react";
import { Actions } from "./Actions";
import { faPen, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BaseEntityDto } from "lib";

type Entity = BaseEntityDto & { id: string; createdAt: Date; updatedAt: Date; deleted: boolean };

const meta = {
  title: "Components/Actions/Actions",
  component: Actions,
  tags: ["autodocs"],
  args: {
    showActionTexts: false,
    actions: [
      {
        id: "view",
        tooltip: "View",
        icon: <FontAwesomeIcon icon={faEye} />,
        onClick: () => alert("View"),
      },
      {
        id: "edit",
        tooltip: "Edit",
        icon: <FontAwesomeIcon icon={faPen} />,
        onClick: () => alert("Edit"),
      },
      {
        id: "delete",
        tooltip: "Delete",
        icon: <FontAwesomeIcon icon={faTrash} />,
        onClick: () => alert("Delete"),
      },
    ],
  },
} satisfies Meta<typeof Actions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithText: Story = {
  args: { showActionTexts: true },
};
