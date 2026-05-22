import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotFoundView } from "./NotFoundView";

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

describe("NotFoundView", () => {
  it("renders title, body, and CTA pointing to ctaTo", () => {
    render(
      <NotFoundView
        title="Not found"
        body="The page you requested does not exist."
        ctaLabel="Go home"
        ctaTo="/"
      />,
    );

    expect(screen.getByText("Not found")).toBeTruthy();
    expect(
      screen.getByText("The page you requested does not exist."),
    ).toBeTruthy();

    const link = screen.getByTestId("cta-link");
    expect(link.getAttribute("href")).toBe("/");
    expect(link.textContent).toBe("Go home");
  });

  it("merges custom className overrides", () => {
    const { container } = render(
      <NotFoundView
        title="Title"
        body="Body"
        ctaLabel="Home"
        ctaTo="/home"
        className="custom-main"
        titleClassName="custom-title"
        bodyClassName="custom-body"
        ctaClassName="custom-cta"
      />,
    );

    expect(container.querySelector("main")?.className).toContain("custom-main");
    expect(container.querySelector("h2")?.className).toContain("custom-title");
    expect(container.querySelector("p")?.className).toContain("custom-body");
    expect(screen.getByTestId("cta-link").className).toContain("custom-cta");
  });

  it("accepts ReactNode content for title/body/ctaLabel", () => {
    render(
      <NotFoundView
        title={<span data-testid="custom-title">404</span>}
        body={<em data-testid="custom-body">missing</em>}
        ctaLabel={<strong data-testid="custom-cta">home</strong>}
        ctaTo="/"
      />,
    );

    expect(screen.getByTestId("custom-title").textContent).toBe("404");
    expect(screen.getByTestId("custom-body").textContent).toBe("missing");
    expect(screen.getByTestId("custom-cta").textContent).toBe("home");
  });
});
