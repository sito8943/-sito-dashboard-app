import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TabsLayout } from "./TabsLayout";
import { ConfigProvider } from "providers/ConfigProvider";

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

const Link = ({
  to,
  children,
  ...rest
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

describe("TabsLayout", () => {
  it("falls back to #id when a tab does not provide a route", () => {
    render(
      <ConfigProvider
        location={{ pathname: "/", search: "", hash: "" }}
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
        location={{ pathname: "/", search: "", hash: "" }}
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
});
