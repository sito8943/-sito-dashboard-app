import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OfflineBanner } from "./OfflineBanner";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? "offline",
  }),
  classNames: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

describe("OfflineBanner", () => {
  afterEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("does not render when online", () => {
    const { container } = render(<OfflineBanner isOnline={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the default translated message when offline", () => {
    render(<OfflineBanner isOnline={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("You are offline");
  });

  it("renders a custom message and class name", () => {
    render(
      <OfflineBanner
        isOnline={false}
        message="No connection"
        className="custom-banner"
      />,
    );

    const banner = screen.getByRole("status");
    expect(banner).toHaveTextContent("No connection");
    expect(banner).toHaveClass("offline-banner");
    expect(banner).toHaveClass("custom-banner");
  });

  it("uses navigator.onLine when isOnline prop is omitted", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("You are offline");
  });
});
