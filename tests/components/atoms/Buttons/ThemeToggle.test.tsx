import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/atoms/Buttons/ThemeToggle";
import { ThemeProvider } from "@/providers/Theme/ThemeProvider";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  classNames: (...values: Array<string | null | undefined | false>) =>
    values.filter(Boolean).join(" "),
  IconButton: ({
    icon,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: React.ReactNode;
  }) => <button {...props}>{icon}</button>,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => vi.unstubAllGlobals());

  it("labels the button with the theme it switches to and toggles", () => {
    const onClick = vi.fn();
    render(
      <ThemeProvider>
        <ThemeToggle onClick={onClick} />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", {
      name: "_accessibility:ariaLabels.switchToDark",
    });
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "moon");

    act(() => button.click());

    expect(onClick).toHaveBeenCalledOnce();
    expect(document.documentElement).toHaveClass("dark");
    const next = screen.getByRole("button", {
      name: "_accessibility:ariaLabels.switchToLight",
    });
    expect(next.querySelector("svg")).toHaveAttribute("data-icon", "sun");
  });
});
