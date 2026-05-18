import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("components/app/Notification", () => ({
  Notification: () => <div data-testid="notification" />,
}));

describe("AppShell", () => {
  it("renders children inside the app-shell wrapper", () => {
    const { container } = render(
      <AppShell>
        <main data-testid="route-content">page</main>
      </AppShell>,
    );

    expect(screen.getByTestId("route-content")).toBeTruthy();
    expect(container.querySelector(".app-shell")).toBeTruthy();
  });

  it("renders all slots in declared order: header, children, footer, bottomNav, extras, Notification", () => {
    const { container } = render(
      <AppShell
        header={<div data-testid="hdr">hdr</div>}
        footer={<div data-testid="ftr">ftr</div>}
        bottomNavigation={<div data-testid="btm">btm</div>}
        extras={<div data-testid="xtr">xtr</div>}
      >
        <main data-testid="cnt">cnt</main>
      </AppShell>,
    );

    const shell = container.querySelector(".app-shell");
    const children = Array.from(shell?.children ?? []);
    const ids = children.map((node) => node.getAttribute("data-testid"));

    expect(ids).toEqual(["hdr", "cnt", "ftr", "btm", "xtr", "notification"]);
  });

  it("hides Notification when withNotification is false", () => {
    render(
      <AppShell withNotification={false}>
        <main />
      </AppShell>,
    );

    expect(screen.queryByTestId("notification")).toBeNull();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(
      <AppShell className="custom-shell">
        <main />
      </AppShell>,
    );

    expect(container.querySelector(".app-shell")?.className).toContain(
      "custom-shell",
    );
  });

  it("omits optional slots when not provided", () => {
    const { container } = render(
      <AppShell>
        <main data-testid="cnt" />
      </AppShell>,
    );

    const shell = container.querySelector(".app-shell");
    const ids = Array.from(shell?.children ?? []).map((node) =>
      node.getAttribute("data-testid"),
    );

    expect(ids).toEqual(["cnt", "notification"]);
  });
});
