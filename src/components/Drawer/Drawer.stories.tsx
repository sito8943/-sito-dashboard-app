import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Drawer } from "./Drawer";
import { faHome, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import type { MenuItemType } from "lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Keys = "dashboard" | "settings" | "profile";

const menuMap: MenuItemType<Keys>[] = [
  { page: "dashboard", path: "", icon: <FontAwesomeIcon icon={faHome} /> },
  { type: "divider" },
  { page: "settings", path: "", icon: <FontAwesomeIcon icon={faCog} /> },
  { page: "profile", path: "", icon: <FontAwesomeIcon icon={faUser} /> },
];

const meta = {
  title: "Components/Drawer/Drawer",
  component: Drawer,
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: true,
    onClose: () => {},
    menuMap: menuMap,
  },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button className="button outlined" onClick={() => setOpen(true)}>Open drawer</button>
        <Drawer<Keys> open={open} onClose={() => setOpen(false)} menuMap={menuMap} />
      </div>
    );
  },
};
