import type { Meta, StoryObj } from "@storybook/react";
import { ActionsDropdown } from "./ActionsDropdown";
import { faPen, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const meta = {
  title: "Components/Actions/ActionsDropdown",
  component: ActionsDropdown,
  tags: ["autodocs"],
  args: {
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
} satisfies Meta<typeof ActionsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
