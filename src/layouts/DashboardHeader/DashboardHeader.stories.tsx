import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { faHome, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ConfigProvider, DrawerMenuProvider } from "providers";
import type { BaseLinkPropsType } from "components";
import { NavbarProvider } from "components/app/Navbar/NavbarProvider";
import type { MenuItemType } from "lib";

import { DashboardHeader } from "./DashboardHeader";

type Keys = "dashboard" | "settings" | "profile";

const menuMap: MenuItemType<Keys>[] = [
  { page: "dashboard", path: "", icon: <FontAwesomeIcon icon={faHome} /> },
  { type: "divider" },
  { page: "settings", path: "", icon: <FontAwesomeIcon icon={faCog} /> },
  { page: "profile", path: "", icon: <FontAwesomeIcon icon={faUser} /> },
];

const MockLink: ComponentType<BaseLinkPropsType> = ({
  children,
  to,
  className,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const meta = {
  title: "Layouts/DashboardHeader",
  component: DashboardHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        location={{ pathname: "/" } as Location}
        navigate={() => {}}
        linkComponent={MockLink}
      >
        <DrawerMenuProvider>
          <NavbarProvider>
            <div style={{ minHeight: 320 }}>
              <Story />
            </div>
          </NavbarProvider>
        </DrawerMenuProvider>
      </ConfigProvider>
    ),
  ],
  args: {
    menuMap,
  },
} satisfies Meta<typeof DashboardHeader<Keys>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithOfflineBanner: Story = {
  args: {
    showOfflineBanner: true,
  },
};
