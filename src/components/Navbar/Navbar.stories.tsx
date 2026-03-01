import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { faChevronLeft, faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar } from "./Navbar";
import { NavbarProvider, useNavbar } from "./NavbarProvider";

const meta = {
  title: "Components/Navbar/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    openDrawer: { action: "openDrawer" },
  },
  args: {
    openDrawer: () => {},
    showSearch: true,
  },
  decorators: [
    (Story) => (
      <NavbarProvider>
        <Story />
      </NavbarProvider>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithoutSearch: Story = {
  args: {
    showSearch: false,
  },
};

export const WithCustomMenuButtonProps: Story = {
  args: {
    menuButtonProps: {
      icon: faChevronLeft,
      variant: "outlined",
      color: "primary",
      className: "custom-menu-button",
      name: "Volver",
      "aria-label": "Abrir navegación principal",
    },
  },
};

// Helper component to inject title via context
function WithTitleHelper({ title, children }: { title: string; children: React.ReactNode }) {
  const { setTitle } = useNavbar();
  useEffect(() => {
    setTitle(title);
    return () => setTitle("");
  }, [title, setTitle]);
  return <>{children}</>;
}

export const WithCustomTitle: Story = {
  decorators: [
    (Story) => (
      <NavbarProvider>
        <WithTitleHelper title="Mi Aplicación">
          <Story />
        </WithTitleHelper>
      </NavbarProvider>
    ),
  ],
};

// Helper component to inject rightContent via context
function WithRightContentHelper({ children }: { children: React.ReactNode }) {
  const { setRightContent } = useNavbar();
  useEffect(() => {
    setRightContent(
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button aria-label="notifications">
          <FontAwesomeIcon icon={faBell} />
        </button>
        <button aria-label="profile">
          <FontAwesomeIcon icon={faUser} />
        </button>
      </div>
    );
    return () => setRightContent(null);
  }, [setRightContent]);
  return <>{children}</>;
}

export const WithRightContent: Story = {
  decorators: [
    (Story) => (
      <NavbarProvider>
        <WithRightContentHelper>
          <Story />
        </WithRightContentHelper>
      </NavbarProvider>
    ),
  ],
};

export const WithTitleAndRightContent: Story = {
  decorators: [
    (Story) => (
      <NavbarProvider>
        <WithTitleHelper title="Dashboard">
          <WithRightContentHelper>
            <Story />
          </WithRightContentHelper>
        </WithTitleHelper>
      </NavbarProvider>
    ),
  ],
};
