import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopBanner } from "./TopBanner";

vi.mock("@sito/dashboard", () => ({
  classNames: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

describe("TopBanner", () => {
  it("renders children when visible", () => {
    render(<TopBanner>Hello</TopBanner>);
    expect(screen.getByRole("status")).toHaveTextContent("Hello");
  });

  it("returns null when visible=false", () => {
    const { container } = render(<TopBanner visible={false}>Hidden</TopBanner>);
    expect(container.firstChild).toBeNull();
  });

  it("applies the color class", () => {
    render(<TopBanner color="error">Oops</TopBanner>);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("top-banner");
    expect(el).toHaveClass("top-banner--error");
  });

  it("defaults to color=default", () => {
    render(<TopBanner>x</TopBanner>);
    expect(screen.getByRole("status")).toHaveClass("top-banner--default");
  });

  it.each([
    "default",
    "primary",
    "secondary",
    "tertiary",
    "quaternary",
    "info",
    "success",
    "warning",
    "error",
  ] as const)("supports color=%s", (color) => {
    render(<TopBanner color={color}>{color}</TopBanner>);
    expect(screen.getByRole("status")).toHaveClass(`top-banner--${color}`);
  });

  it("merges custom className", () => {
    render(<TopBanner className="extra">x</TopBanner>);
    expect(screen.getByRole("status")).toHaveClass("extra");
  });

  it("honors role and ariaLive overrides", () => {
    render(
      <TopBanner role="alert" ariaLive="assertive">
        boom
      </TopBanner>,
    );
    const el = screen.getByRole("alert");
    expect(el).toHaveAttribute("aria-live", "assertive");
  });
});
