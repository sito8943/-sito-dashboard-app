import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LegalPage } from "./LegalPage";
import { LegalSection } from "./LegalSection";
import { LegalLinksList } from "./LegalLinksList";

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
      <a href={to} className={className} data-testid={`link-${to}`}>
        {children}
      </a>
    ),
  }),
}));

describe("LegalPage", () => {
  it("renders title and children", () => {
    render(
      <LegalPage title="Terms">
        <p data-testid="custom-child">body</p>
      </LegalPage>,
    );

    expect(screen.getByText("Terms")).toBeTruthy();
    expect(screen.getByTestId("custom-child").textContent).toBe("body");
  });

  it("renders intro only when provided", () => {
    const { container, rerender } = render(<LegalPage title="t" />);
    expect(container.querySelector(".legal-page-intro")).toBeNull();

    rerender(
      <LegalPage title="t" intro={<span data-testid="intro">i</span>} />,
    );
    expect(screen.getByTestId("intro").textContent).toBe("i");
  });

  it("merges class overrides", () => {
    const { container } = render(
      <LegalPage
        title="t"
        intro="i"
        className="custom-main"
        titleClassName="custom-title"
        introClassName="custom-intro"
      />,
    );

    expect(container.querySelector("main")?.className).toContain("custom-main");
    expect(container.querySelector("h2")?.className).toContain("custom-title");
    expect(container.querySelector(".legal-page-intro")?.className).toContain(
      "custom-intro",
    );
  });
});

describe("LegalSection", () => {
  it("renders title + body slot", () => {
    render(
      <LegalSection title="Section">
        <p data-testid="body">body</p>
      </LegalSection>,
    );

    expect(screen.getByText("Section")).toBeTruthy();
    expect(screen.getByTestId("body").textContent).toBe("body");
  });

  it("merges class overrides", () => {
    const { container } = render(
      <LegalSection
        title="t"
        className="custom-card"
        titleClassName="custom-title"
        bodyClassName="custom-body"
      >
        body
      </LegalSection>,
    );

    expect(container.querySelector("article")?.className).toContain(
      "custom-card",
    );
    expect(container.querySelector("h3")?.className).toContain("custom-title");
    expect(container.querySelector(".legal-section-body")?.className).toContain(
      "custom-body",
    );
  });
});

describe("LegalLinksList", () => {
  it("renders nothing when links is empty", () => {
    const { container } = render(<LegalLinksList links={[]} />);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("renders links via linkComponent from ConfigProvider", () => {
    render(
      <LegalLinksList
        links={[
          { to: "/terms", label: "Terms" },
          { to: "/privacy", label: "Privacy" },
        ]}
      />,
    );

    const terms = screen.getByTestId("link-/terms");
    const privacy = screen.getByTestId("link-/privacy");
    expect(terms.getAttribute("href")).toBe("/terms");
    expect(terms.textContent).toBe("Terms");
    expect(privacy.textContent).toBe("Privacy");
  });

  it("merges class overrides on list + item + link", () => {
    const { container } = render(
      <LegalLinksList
        links={[{ to: "/x", label: "X" }]}
        className="custom-list"
        itemClassName="custom-item"
        linkClassName="custom-link"
      />,
    );

    expect(container.querySelector("ul")?.className).toContain("custom-list");
    expect(container.querySelector("li")?.className).toContain("custom-item");
    expect(screen.getByTestId("link-/x").className).toContain("custom-link");
  });
});
