import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ComponentProps, MouseEvent } from "react";

import { faFile, faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Location } from "lib";
import { ConfigProvider } from "providers/ConfigProvider";
import {
  BottomNavActionProvider,
  useRegisterBottomNavAction,
  type BottomNavActionRegistrationType,
} from "providers";
import type { BaseLinkPropsType } from "components/types";
import type { BottomNavigationItemType } from "./types";
import { BottomNavigation } from "./BottomNavigation";

vi.mock("components", () => ({
  AppIconButton: ({
    onClick,
    "aria-label": ariaLabel,
    className,
  }: {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    "aria-label"?: string;
    className?: string;
  }) => (
    <button onClick={onClick} aria-label={ariaLabel} className={className}>
      center-action
    </button>
  ),
}));

const Link = ({ to, children, ...rest }: BaseLinkPropsType) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

const baseLocation: Location = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "test-location",
};

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
    position: "right",
  },
];

const RegisterBottomAction = ({
  action,
}: {
  action: BottomNavActionRegistrationType;
}) => {
  useRegisterBottomNavAction(action);
  return null;
};

const renderBottomNavigation = (params?: {
  location?: Location;
  navigate?: (route: string | number) => void;
  navItems?: BottomNavigationItemType[];
  centerAction?: ComponentProps<typeof BottomNavigation>["centerAction"];
  registerAction?: BottomNavActionRegistrationType;
}) => {
  const {
    location = baseLocation,
    navigate = () => {},
    navItems = items,
    centerAction,
    registerAction,
  } = params ?? {};

  return render(
    <ConfigProvider
      location={location}
      navigate={navigate}
      linkComponent={Link}
    >
      {registerAction === undefined ? (
        <BottomNavigation items={navItems} centerAction={centerAction} />
      ) : (
        <BottomNavActionProvider>
          <RegisterBottomAction action={registerAction} />
          <BottomNavigation items={navItems} centerAction={centerAction} />
        </BottomNavActionProvider>
      )}
    </ConfigProvider>,
  );
};

describe("BottomNavigation", () => {
  it("renders links with active class using ConfigProvider link component", () => {
    renderBottomNavigation({
      location: {
        ...baseLocation,
        pathname: "/notes",
      },
    });

    const homeLink = screen.getByRole("link", { name: "Home" });
    const notesLink = screen.getByRole("link", { name: "Notes" });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(notesLink).toHaveAttribute("href", "/notes");
    expect(notesLink).toHaveClass("text-hover-primary");
    expect(homeLink).toHaveClass("text-text-muted/60");
  });

  it("navigates to center action path when clicked", () => {
    const navigate = vi.fn();

    renderBottomNavigation({
      navigate,
      centerAction: {
        icon: faPlus,
        to: "/log",
        ariaLabel: "Log period",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log period" }));

    expect(navigate).toHaveBeenCalledWith("/log");
  });

  it("does not navigate when center action onClick prevents default", () => {
    const navigate = vi.fn();

    renderBottomNavigation({
      navigate,
      centerAction: {
        icon: faPlus,
        to: "/log",
        ariaLabel: "Log period",
        onClick: (event) => event.preventDefault(),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log period" }));

    expect(navigate).not.toHaveBeenCalled();
  });

  it("renders disabled items without links", () => {
    renderBottomNavigation({
      navItems: [
        {
          id: "home",
          label: "Home",
          to: "/",
          icon: faHome,
          disabled: true,
        },
      ],
    });

    expect(
      screen.queryByRole("link", { name: "Home" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("overrides center action from BottomNavActionProvider", () => {
    const navigate = vi.fn();

    renderBottomNavigation({
      navigate,
      centerAction: {
        icon: faPlus,
        to: "/log",
        ariaLabel: "Log period",
      },
      registerAction: {
        ariaLabel: "Quick add",
        to: "/quick",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Quick add" }));

    expect(navigate).toHaveBeenCalledWith("/quick");
  });

  it("keeps props destination when registered center action is callback-only", () => {
    const navigate = vi.fn();
    const onAction = vi.fn();

    renderBottomNavigation({
      navigate,
      centerAction: {
        icon: faPlus,
        to: "/log",
        ariaLabel: "Log period",
      },
      registerAction: onAction,
    });

    fireEvent.click(screen.getByRole("button", { name: "Log period" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/log");
  });
});
