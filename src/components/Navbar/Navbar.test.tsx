import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "./Navbar";

const { useConfigMock } = vi.hoisted(() => ({
  useConfigMock: vi.fn(),
}));

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("providers", () => ({
  useConfig: () => useConfigMock(),
}));

vi.mock("components", () => ({
  AppIconButton: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick?: () => void;
    "aria-label"?: string;
  }) => <button onClick={onClick} aria-label={ariaLabel} />,
}));

vi.mock("./Clock", () => ({
  Clock: () => <div data-testid="clock" />,
}));

vi.mock("lib", () => ({
  isMac: () => false,
}));

const baseProps = { openDrawer: vi.fn() };

describe("Navbar", () => {
  beforeEach(() => {
    useConfigMock.mockReturnValue({ searchComponent: null, location: window.location });
  });

  it("renders the header element", () => {
    render(<Navbar {...baseProps} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the app name heading", () => {
    render(<Navbar {...baseProps} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("shows the clock by default", () => {
    render(<Navbar {...baseProps} />);
    expect(screen.getByTestId("clock")).toBeInTheDocument();
  });

  it("hides the clock when showClock is false", () => {
    render(<Navbar {...baseProps} showClock={false} />);
    expect(screen.queryByTestId("clock")).not.toBeInTheDocument();
  });

  it("calls openDrawer when the menu button is clicked", () => {
    const openDrawer = vi.fn();
    render(<Navbar {...baseProps} openDrawer={openDrawer} />);
    // first button is the menu button
    screen.getAllByRole("button")[0].click();
    expect(openDrawer).toHaveBeenCalledOnce();
  });

  it("opens the search dialog on Ctrl+Shift+F", () => {
    const SearchComponent = ({ open }: { open: boolean }) =>
      open ? <div data-testid="search-dialog" /> : null;

    useConfigMock.mockReturnValue({ searchComponent: SearchComponent, location: window.location });
    window.history.pushState({}, "", "/dashboard");

    render(<Navbar {...baseProps} />);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          ctrlKey: true,
          shiftKey: true,
          key: "f",
          bubbles: true,
        })
      );
    });

    expect(screen.getByTestId("search-dialog")).toBeInTheDocument();

    // cleanup
    window.history.pushState({}, "", "/");
  });

  it("does not open search on Ctrl+Shift+F when at root path", () => {
    const SearchComponent = ({ open }: { open: boolean }) =>
      open ? <div data-testid="search-dialog" /> : null;

    useConfigMock.mockReturnValue({ searchComponent: SearchComponent, location: window.location });
    window.history.pushState({}, "", "/");

    render(<Navbar {...baseProps} />);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          ctrlKey: true,
          shiftKey: true,
          key: "f",
          bubbles: true,
        })
      );
    });

    expect(screen.queryByTestId("search-dialog")).not.toBeInTheDocument();
  });
});
