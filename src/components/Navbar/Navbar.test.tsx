import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "./Navbar";
import { NavbarProvider, useNavbar } from "./NavbarProvider";
import { useEffect } from "react";

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

const renderWithProvider = (ui: React.ReactElement) =>
  render(<NavbarProvider>{ui}</NavbarProvider>);

describe("Navbar", () => {
  beforeEach(() => {
    useConfigMock.mockReturnValue({
      searchComponent: null,
      location: window.location,
    });
  });

  it("renders the header element", () => {
    renderWithProvider(<Navbar {...baseProps} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the app name heading", () => {
    renderWithProvider(<Navbar {...baseProps} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("calls openDrawer when the menu button is clicked", () => {
    const openDrawer = vi.fn();
    renderWithProvider(<Navbar {...baseProps} openDrawer={openDrawer} />);
    // first button is the menu button
    screen.getAllByRole("button")[0].click();
    expect(openDrawer).toHaveBeenCalledOnce();
  });

  it("opens the search dialog on Ctrl+Shift+F", () => {
    const SearchComponent = ({ open }: { open: boolean }) =>
      open ? <div data-testid="search-dialog" /> : null;

    useConfigMock.mockReturnValue({
      searchComponent: SearchComponent,
      location: window.location,
    });
    window.history.pushState({}, "", "/dashboard");

    renderWithProvider(<Navbar {...baseProps} />);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          ctrlKey: true,
          shiftKey: true,
          key: "f",
          bubbles: true,
        }),
      );
    });

    expect(screen.getByTestId("search-dialog")).toBeInTheDocument();

    // cleanup
    window.history.pushState({}, "", "/");
  });

  it("does not open search on Ctrl+Shift+F when at root path", () => {
    const SearchComponent = ({ open }: { open: boolean }) =>
      open ? <div data-testid="search-dialog" /> : null;

    useConfigMock.mockReturnValue({
      searchComponent: SearchComponent,
      location: window.location,
    });
    window.history.pushState({}, "", "/");

    renderWithProvider(<Navbar {...baseProps} />);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          ctrlKey: true,
          shiftKey: true,
          key: "f",
          bubbles: true,
        }),
      );
    });

    expect(screen.queryByTestId("search-dialog")).not.toBeInTheDocument();
  });
});

describe("NavbarProvider", () => {
  beforeEach(() => {
    useConfigMock.mockReturnValue({
      searchComponent: null,
      location: window.location,
    });
  });

  it("renders children", () => {
    render(
      <NavbarProvider>
        <div data-testid="child" />
      </NavbarProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides default empty title — navbar falls back to app name key", () => {
    renderWithProvider(<Navbar {...baseProps} />);
    expect(
      screen.getByRole("heading", { name: "_pages:home.appName" }),
    ).toBeInTheDocument();
  });

  it("allows setting the title", () => {
    function Setter() {
      const { setTitle } = useNavbar();
      useEffect(() => {
        setTitle("My App");
      }, [setTitle]);
      return null;
    }
    renderWithProvider(<Navbar {...baseProps} />);

    // Render Setter inside same provider to verify Navbar picks it up
    function App() {
      return (
        <NavbarProvider>
          <Setter />
          <Navbar {...baseProps} />
        </NavbarProvider>
      );
    }
    render(<App />);

    expect(screen.getByRole("heading", { name: "My App" })).toBeInTheDocument();
  });

  it("shows custom title in the heading when set via context", () => {
    function App() {
      return (
        <NavbarProvider>
          <TitleSetter title="Custom Title" />
          <Navbar {...baseProps} />
        </NavbarProvider>
      );
    }
    function TitleSetter({ title }: { title: string }) {
      const { setTitle } = useNavbar();
      useEffect(() => {
        setTitle(title);
      }, [title, setTitle]);
      return null;
    }
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Custom Title" }),
    ).toBeInTheDocument();
  });

  it("falls back to t(appName) when title is empty", () => {
    renderWithProvider(<Navbar {...baseProps} />);
    // t() returns the key itself in mock
    expect(
      screen.getByRole("heading", { name: "_pages:home.appName" }),
    ).toBeInTheDocument();
  });

  it("renders rightContent before the search button", () => {
    function App() {
      return (
        <NavbarProvider>
          <RightContentSetter />
          <Navbar {...baseProps} />
        </NavbarProvider>
      );
    }
    function RightContentSetter() {
      const { setRightContent } = useNavbar();
      useEffect(() => {
        setRightContent(<span data-testid="right-custom">Extra</span>);
      }, [setRightContent]);
      return null;
    }
    render(<App />);
    expect(screen.getByTestId("right-custom")).toBeInTheDocument();
  });

  it("renders no extra right content by default", () => {
    renderWithProvider(<Navbar {...baseProps} />);
    expect(screen.queryByTestId("right-custom")).not.toBeInTheDocument();
  });
});
