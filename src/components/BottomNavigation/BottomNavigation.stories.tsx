import type { Meta, StoryObj } from "@storybook/react";
import {
  faFile,
  faHome,
  faPlus,
  faTags,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { BottomNavActionProvider, useRegisterBottomNavAction } from "providers";

import { BottomNavigation } from "./BottomNavigation";
import type { BottomNavigationItemType } from "./types";

const items: BottomNavigationItemType[] = [
  {
    id: "home",
    label: "Home",
    to: "/",
    icon: faHome,
    position: "left",
  },
  {
    id: "notes",
    label: "Notes",
    to: "/notes",
    icon: faFile,
    position: "left",
  },
  {
    id: "categories",
    label: "Categories",
    to: "/categories",
    icon: faTags,
    position: "right",
  },
  {
    id: "profile",
    label: "Profile",
    to: "/profile",
    icon: faUser,
    position: "right",
  },
];

const meta = {
  title: "Components/BottomNavigation/BottomNavigation",
  component: BottomNavigation,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
  },
  args: {
    items,
    className: "sm:!block",
    centerAction: {
      icon: faPlus,
      ariaLabel: "Quick action",
      to: "/log",
    },
  },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const DynamicCenterActionRegistration = () => {
  useRegisterBottomNavAction({
    icon: faTags,
    ariaLabel: "Dynamic category action",
    to: "/categories/new",
    color: "secondary",
  });

  return null;
};

export const Basic: Story = {};

export const WithoutCenterAction: Story = {
  args: {
    centerAction: null,
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      {
        id: "home",
        label: "Home",
        to: "/",
        icon: faHome,
        position: "left",
      },
      {
        id: "notes",
        label: "Notes",
        to: "/notes",
        icon: faFile,
        position: "left",
        disabled: true,
      },
      {
        id: "profile",
        label: "Profile",
        to: "/profile",
        icon: faUser,
        position: "right",
      },
    ],
  },
};

export const WithDynamicCenterActionOverride: Story = {
  render: (args) => (
    <BottomNavActionProvider>
      <DynamicCenterActionRegistration />
      <BottomNavigation {...args} />
    </BottomNavActionProvider>
  ),
  args: {
    centerAction: {
      icon: faPlus,
      ariaLabel: "Quick action",
      to: "/log",
      color: "primary",
    },
  },
};
