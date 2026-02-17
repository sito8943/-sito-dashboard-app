import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Drawer } from "./Drawer";
import { faHome, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import type { MenuItemType, SubMenuItemType } from "lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DrawerMenuProvider, useDrawerMenu } from "providers";

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
        <button className="button outlined" onClick={() => setOpen(true)}>
          Open drawer
        </button>
        <Drawer<Keys>
          logo={<div className="logo">My App Logo</div>}
          open={open}
          onClose={() => setOpen(false)}
          menuMap={menuMap}
        />
      </div>
    );
  },
};

const dynamicParent: Keys = "dashboard";

const DynamicDrawerExample = () => {
  const [open, setOpen] = useState(true);
  const [nextItem, setNextItem] = useState(1);
  const { dynamicItems, addChildItem, removeChildItem, clearDynamicItems } =
    useDrawerMenu<Keys>();

  const items = dynamicItems[dynamicParent] ?? [];

  const handleAddItem = () => {
    const itemNumber = nextItem;
    const item: SubMenuItemType = {
      id: `dynamic-item-${itemNumber}`,
      label: `Dynamic item ${itemNumber}`,
      path: `/dashboard?item=${itemNumber}`,
    };

    addChildItem(dynamicParent, item);
    setNextItem((prev) => prev + 1);
  };

  const handleRemoveItem = () => {
    if (!items.length) return;
    removeChildItem(dynamicParent, items.length - 1);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="button contained primary" onClick={() => setOpen(true)}>
          Open drawer
        </button>
        <button className="button outlined" onClick={handleAddItem}>
          Agregar item
        </button>
        <button
          className="button outlined"
          onClick={handleRemoveItem}
          disabled={!items.length}
        >
          Remover item
        </button>
        <button
          className="button outlined"
          onClick={() => clearDynamicItems(dynamicParent)}
          disabled={!items.length}
        >
          Limpiar items
        </button>
      </div>

      <p className="mb-4">Items dinámicos en dashboard: {items.length}</p>

      <Drawer<Keys>
        logo={<div className="logo">My App Logo</div>}
        open={open}
        onClose={() => setOpen(false)}
        menuMap={menuMap}
      />
    </div>
  );
};

export const WithDynamicItems: Story = {
  args: {
    open: true,
    onClose: () => {},
    menuMap: menuMap,
  },
  render: () => (
    <DrawerMenuProvider<Keys>>
      <DynamicDrawerExample />
    </DrawerMenuProvider>
  ),
};
