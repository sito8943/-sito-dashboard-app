import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/providers/Theme/ThemeProvider";
import { useOptionalTheme } from "@/providers/Theme/useOptionalTheme";
import { useTheme } from "@/providers/Theme/useTheme";
import { getThemeBootScript, THEME_BOOT_SCRIPT } from "@/lib/utils/theme";

type Listener = (event: MediaQueryListEvent) => void;

let systemDark = false;
let listeners: Listener[] = [];

const mockMatchMedia = () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: systemDark,
      media: query,
      addEventListener: (_: string, listener: Listener) => {
        listeners.push(listener);
      },
      removeEventListener: (_: string, listener: Listener) => {
        listeners = listeners.filter((item) => item !== listener);
      },
    })),
  );
};

const emitSystemChange = (dark: boolean) => {
  systemDark = dark;
  act(() => {
    listeners.forEach((listener) =>
      listener({ matches: dark } as MediaQueryListEvent),
    );
  });
};

const Consumer = () => {
  const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setMode("system")}>system</button>
      <button onClick={() => setMode("light")}>light</button>
    </>
  );
};

const html = document.documentElement;

describe("ThemeProvider", () => {
  beforeEach(() => {
    systemDark = false;
    listeners = [];
    mockMatchMedia();
    html.classList.remove("dark");
    html.style.colorScheme = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.head.querySelector('meta[name="theme-color"]')?.remove();
  });

  it("defaults to system mode and resolves light when the OS is light", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(html).not.toHaveClass("dark");
    expect(html.style.colorScheme).toBe("light");
  });

  it("resolves dark in system mode when the OS prefers dark", () => {
    systemDark = true;
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(html).toHaveClass("dark");
    expect(html.style.colorScheme).toBe("dark");
  });

  it("follows prefers-color-scheme changes while mode is system", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    emitSystemChange(true);
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(html).toHaveClass("dark");

    emitSystemChange(false);
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(html).not.toHaveClass("dark");
  });

  it("ignores prefers-color-scheme changes once an explicit mode is set", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    act(() => screen.getByRole("button", { name: "light" }).click());
    emitSystemChange(true);
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(html).not.toHaveClass("dark");
  });

  it("toggles the resolved theme and persists the choice", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    act(() => screen.getByRole("button", { name: "toggle" }).click());
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    expect(html).toHaveClass("dark");
    expect(localStorage.getItem("sito-theme")).toBe("dark");

    act(() => screen.getByRole("button", { name: "toggle" }).click());
    expect(screen.getByTestId("mode")).toHaveTextContent("light");
    expect(html).not.toHaveClass("dark");
    expect(localStorage.getItem("sito-theme")).toBe("light");
  });

  it("restores the persisted mode using a custom storageKey", () => {
    localStorage.setItem("app-theme", "dark");
    render(
      <ThemeProvider storageKey="app-theme">
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    expect(html).toHaveClass("dark");
  });

  it("falls back to defaultMode when the stored value is invalid", () => {
    localStorage.setItem("sito-theme", "purple");
    render(
      <ThemeProvider defaultMode="dark">
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });

  it("keeps working when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("system");
    act(() => screen.getByRole("button", { name: "toggle" }).click());
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");

    vi.restoreAllMocks();
  });

  it("updates <meta name=theme-color> when themeColors is provided", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#000000";
    document.head.appendChild(meta);

    render(
      <ThemeProvider themeColors={{ light: "#041e42", dark: "#0f141c" }}>
        <Consumer />
      </ThemeProvider>,
    );
    expect(meta.content).toBe("#041e42");
    act(() => screen.getByRole("button", { name: "toggle" }).click());
    expect(meta.content).toBe("#0f141c");
  });

  it("useTheme throws outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow(
      "useTheme must be used within ThemeProvider",
    );
    spy.mockRestore();
  });

  it("useOptionalTheme returns undefined outside the provider", () => {
    const Probe = () => (
      <span data-testid="probe">
        {useOptionalTheme() === undefined ? "undefined" : "defined"}
      </span>
    );
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("undefined");
  });
});

describe("getThemeBootScript", () => {
  beforeEach(() => {
    html.classList.remove("dark");
    html.style.colorScheme = "";
  });

  afterEach(() => vi.unstubAllGlobals());

  // Mirrors what the browser does with the inline <script> in index.html.
  // oxlint-disable-next-line no-implied-eval
  const run = (script: string) => new Function(script)();

  it("applies the stored dark mode before React mounts", () => {
    systemDark = false;
    mockMatchMedia();
    localStorage.setItem("sito-theme", "dark");
    run(THEME_BOOT_SCRIPT);
    expect(html).toHaveClass("dark");
    expect(html.style.colorScheme).toBe("dark");
  });

  it("uses the custom key and defaultMode", () => {
    systemDark = true;
    mockMatchMedia();
    run(getThemeBootScript({ storageKey: "x", defaultMode: "light" }));
    expect(html).not.toHaveClass("dark");

    localStorage.setItem("x", "system");
    run(getThemeBootScript({ storageKey: "x", defaultMode: "light" }));
    expect(html).toHaveClass("dark");
  });
});
