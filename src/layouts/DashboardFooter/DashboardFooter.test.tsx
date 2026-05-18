import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardFooter } from "./DashboardFooter";
import { DASHBOARD_FOOTER_CLASSNAMES } from "./constants";

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("components/ui/Buttons", () => ({
  ToTop: () => <button type="button" data-testid="to-top" />,
}));

describe("DashboardFooter", () => {
  it("renders copyright text with current year by default", () => {
    render(<DashboardFooter copyrightText="© Acme" />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© Acme ${currentYear}`)).toBeTruthy();
  });

  it("renders the supplied year override", () => {
    render(<DashboardFooter copyrightText="© Acme" year={2030} />);

    expect(screen.getByText("© Acme 2030")).toBeTruthy();
  });

  it("renders custom children instead of the default copyright paragraph", () => {
    render(
      <DashboardFooter copyrightText="ignored">
        <span data-testid="custom-footer">Hello</span>
      </DashboardFooter>,
    );

    expect(screen.getByTestId("custom-footer")).toBeTruthy();
    expect(screen.queryByText(/ignored/)).toBeNull();
  });

  it("renders ToTop by default and hides it when showToTop is false", () => {
    const { rerender } = render(<DashboardFooter copyrightText="x" />);
    expect(screen.getByTestId("to-top")).toBeTruthy();

    rerender(<DashboardFooter copyrightText="x" showToTop={false} />);
    expect(screen.queryByTestId("to-top")).toBeNull();
  });

  it("applies bottomNavSpacing class only when requested", () => {
    const { container, rerender } = render(
      <DashboardFooter copyrightText="x" />,
    );
    expect(container.querySelector("footer")?.className).not.toContain(
      DASHBOARD_FOOTER_CLASSNAMES.withBottomNavSpacing,
    );

    rerender(<DashboardFooter copyrightText="x" bottomNavSpacing />);
    expect(container.querySelector("footer")?.className).toContain(
      DASHBOARD_FOOTER_CLASSNAMES.withBottomNavSpacing,
    );
  });

  it("merges className and textClassName overrides", () => {
    const { container } = render(
      <DashboardFooter
        copyrightText="© Acme"
        className="custom-footer"
        textClassName="custom-text"
      />,
    );

    expect(container.querySelector("footer")?.className).toContain(
      "custom-footer",
    );
    expect(container.querySelector("p")?.className).toContain("custom-text");
  });
});
