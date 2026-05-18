import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardHeader } from "./DashboardHeader";

vi.mock("components/app/Drawer", () => ({
  Drawer: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="drawer" data-open={open ? "true" : "false"}>
      <button type="button" data-testid="drawer-close" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

vi.mock("components/app/Navbar", () => ({
  Navbar: ({ openDrawer }: { openDrawer: () => void }) => (
    <button type="button" data-testid="navbar-open" onClick={openDrawer}>
      open
    </button>
  ),
}));

vi.mock("components/app/OfflineBanner", () => ({
  OfflineBanner: () => <div data-testid="offline-banner" />,
}));

describe("DashboardHeader", () => {
  it("renders drawer closed by default and Navbar always visible", () => {
    render(<DashboardHeader menuMap={[]} />);

    expect(screen.getByTestId("drawer").getAttribute("data-open")).toBe(
      "false",
    );
    expect(screen.getByTestId("navbar-open")).toBeTruthy();
  });

  it("opens the drawer when Navbar triggers openDrawer", () => {
    render(<DashboardHeader menuMap={[]} />);

    fireEvent.click(screen.getByTestId("navbar-open"));
    expect(screen.getByTestId("drawer").getAttribute("data-open")).toBe("true");
  });

  it("closes the drawer when Drawer triggers onClose", () => {
    render(<DashboardHeader menuMap={[]} />);

    fireEvent.click(screen.getByTestId("navbar-open"));
    fireEvent.click(screen.getByTestId("drawer-close"));

    expect(screen.getByTestId("drawer").getAttribute("data-open")).toBe(
      "false",
    );
  });

  it("hides OfflineBanner by default and shows it when showOfflineBanner is true", () => {
    const { rerender } = render(<DashboardHeader menuMap={[]} />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();

    rerender(<DashboardHeader menuMap={[]} showOfflineBanner />);
    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });
});
