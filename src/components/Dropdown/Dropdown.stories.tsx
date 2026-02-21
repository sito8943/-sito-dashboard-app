import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEye,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "./Dropdown";
import { Actions } from "../Actions";
import { IconButton } from "../Buttons";

const meta = {
  title: "Components/Dropdown/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: false,
    onClose: () => {},
    children: <div className="p-4">Dropdown Content</div>,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-10">
        <button className="button outlined" onClick={() => setOpen(true)}>
          Open
        </button>
        <Dropdown open={open} onClose={() => setOpen(false)}>
          <div className="p-4">This is a dropdown content.</div>
        </Dropdown>
      </div>
    );
  },
};

export const WithTextActionsAndIconTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-10">
        <IconButton icon={faEllipsisV} onClick={() => setOpen(true)} />
        <Dropdown open={open} onClose={() => setOpen(false)}>
          <Actions
            showActionTexts
            showTooltips={false}
            className="flex-col"
            actions={[
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
            ]}
          />
        </Dropdown>
      </div>
    );
  },
};
