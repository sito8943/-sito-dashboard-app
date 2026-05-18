import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import { FeatureUnavailableView } from "./FeatureUnavailableView";

type MockLinkProps = {
  children?: ReactNode;
  className?: string;
  to?: string;
};

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("providers", () => ({
  useConfig: () => ({
    linkComponent: ({ children, to = "", className }: MockLinkProps) => (
      <a href={to} className={className} data-testid="cta-link">
        {children}
      </a>
    ),
  }),
}));

describe("FeatureUnavailableView", () => {
  it("renders default warning icon plus title, body, and CTA", () => {
    const { container } = render(
      <FeatureUnavailableView
        title="Feature off"
        body="Reports are disabled for your role."
        ctaLabel="Back to home"
        ctaTo="/"
      />,
    );

    expect(screen.getByText("Feature off")).toBeTruthy();
    expect(
      screen.getByText("Reports are disabled for your role."),
    ).toBeTruthy();

    const link = screen.getByTestId("cta-link");
    expect(link.getAttribute("href")).toBe("/");
    expect(link.textContent).toBe("Back to home");

    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders custom icon when icon prop is provided", () => {
    const { container } = render(
      <FeatureUnavailableView
        title="Locked"
        body="Upgrade to access this module."
        ctaLabel="Upgrade"
        ctaTo="/billing"
        icon={faLock}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute("data-icon")).toBe("lock");
  });

  it("merges custom className overrides", () => {
    const { container } = render(
      <FeatureUnavailableView
        title="T"
        body="B"
        ctaLabel="C"
        ctaTo="/"
        className="custom-main"
        iconClassName="custom-icon"
        titleClassName="custom-title"
        bodyClassName="custom-body"
        ctaClassName="custom-cta"
      />,
    );

    expect(container.querySelector("main")?.className).toContain("custom-main");
    expect(container.querySelector("svg")?.getAttribute("class")).toContain(
      "custom-icon",
    );
    expect(container.querySelector("h2")?.className).toContain("custom-title");
    expect(container.querySelector("p")?.className).toContain("custom-body");
    expect(screen.getByTestId("cta-link").className).toContain("custom-cta");
  });
});
