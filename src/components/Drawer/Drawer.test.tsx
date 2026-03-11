import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Drawer } from "./Drawer";

import type { MenuItemType } from "lib";

const { useAuthMock, useConfigMock, useDrawerMenuMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useConfigMock: vi.fn(),
  useDrawerMenuMock: vi.fn(),
}));

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("providers", async () => {
  return {
    useAuth: () => useAuthMock(),
    useConfig: () => useConfigMock(),
    useDrawerMenu: () => useDrawerMenuMock(),
  };
});

type Keys = "home";

type LinkProps = {
  children?: ReactNode;
  className?: string;
  tabIndex?: number;
  to: string;
  "aria-label"?: string;
};

const Link = ({ children, to, ...rest }: LinkProps) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

const menuMap: MenuItemType<Keys>[] = [{ page: "home", path: "/home" }];

describe("Drawer", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ account: { email: "user@test.com" } });
    useConfigMock.mockReturnValue({
      linkComponent: Link,
      location: window.location,
    });
    useDrawerMenuMock.mockReturnValue({ dynamicItems: {} });
  });

  it("renders without DrawerMenuProvider", () => {
    expect(() =>
      render(<Drawer<Keys> open={true} onClose={() => {}} menuMap={menuMap} />),
    ).not.toThrow();

    expect(screen.getByText("_pages:home.title")).toBeInTheDocument();
  });

  it("uses dynamic drawer items when context is provided", () => {
    useDrawerMenuMock.mockReturnValue({
      dynamicItems: {
        home: [{ id: "child-1", label: "Child label", path: "/home?item=1" }],
      },
    });

    render(<Drawer<Keys> open={true} onClose={() => {}} menuMap={menuMap} />);

    expect(screen.getByText("Child label")).toBeInTheDocument();
  });
});
