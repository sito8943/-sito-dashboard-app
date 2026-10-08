import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TabsLayout } from "./TabsLayout";
import { ConfigProvider } from "providers/ConfigProvider";
import type { BaseLinkPropsType } from "components/types";
import type { Location } from "lib";

vi.mock("@sito/dashboard", () => ({
  classNames: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("../Buttons", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => <button {...props}>{children}</button>,
}));

const mockLocation: Location = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "default",
};

const Link = ({ to, children, ...rest }: BaseLinkPropsType) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

describe("TabsLayout", () => {
  it("falls back to #id when a tab does not provide a route", () => {
    render(
      <ConfigProvider
        location={mockLocation}
        navigate={() => {}}
        linkComponent={Link}
      >
        <TabsLayout
          tabs={[
            {
              id: "overview",
              label: "Overview",
              content: <div>Overview content</div>,
            },
          ]}
        />
      </ConfigProvider>,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "#overview",
    );
  });

  it("does not switch tabs internally when used as a controlled component", () => {
    const onTabChange = vi.fn();

    render(
      <ConfigProvider
        location={mockLocation}
        navigate={() => {}}
        linkComponent={Link}
      >
        <TabsLayout
          useLinks={false}
          currentTab={1}
          onTabChange={onTabChange}
          tabs={[
            {
              id: 1,
              label: "First",
              content: <div>First content</div>,
            },
            {
              id: 2,
              label: "Second",
              content: <div>Second content</div>,
            },
          ]}
        />
      </ConfigProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(onTabChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("First content")).toBeInTheDocument();
    expect(screen.queryByText("Second content")).not.toBeInTheDocument();
  });

  describe("tab ids", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const renderTabs = (currentTab: string) =>
      render(
        <ConfigProvider
          location={mockLocation}
          navigate={() => {}}
          linkComponent={Link}
        >
          <TabsLayout<"players" | "logs">
            useLinks={false}
            currentTab={currentTab as "players" | "logs"}
            tabs={[
              {
                id: "players",
                label: "Players",
                content: <p>players panel</p>,
              },
              { id: "logs", label: "Logs", content: <p>logs panel</p> },
            ]}
          />
        </ConfigProvider>,
      );

    it("matches currentTab against string ids", () => {
      renderTabs("logs");
      expect(screen.getByText("logs panel")).toBeTruthy();
      expect(screen.queryByText("players panel")).toBeNull();
    });

    it("warns in development when currentTab matches no tab id", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      renderTabs("0");
      expect(screen.queryByText("players panel")).toBeNull();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('No tab has id "0"'),
      );
    });
  });
});
