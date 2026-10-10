import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Page } from "./Page";

const tableOptions = vi.hoisted(() => ({
  value: undefined as { countOfFilters: number } | undefined,
}));

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
  useTranslation: () => ({ t: (key: string) => key }),
  // `undefined` = no TableOptionsProvider above (the hook itself is tested in @sito/dashboard).
  useOptionalTableOptions: () => tableOptions.value,
  Loading: () => <span>loading</span>,
  Badge: ({ count, className }: { count: number; className?: string }) => (
    <span data-testid="filter-badge" className={className}>
      {count}
    </span>
  ),
}));

vi.mock("./PageHeader", () => ({
  PageHeader: ({
    title,
    actions = [],
  }: {
    title?: string;
    actions?: { id: string; children?: ReactNode }[];
  }) => (
    <header>
      <h1>{title}</h1>
      {actions.map((action) => (
        <div key={action.id} data-testid={`action-${action.id}`}>
          {action.children}
        </div>
      ))}
    </header>
  ),
}));

vi.mock("components", () => ({ AppIconButton: () => null }));

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Page title="Servers" filterOptions={{}}>
        <p>content</p>
      </Page>
    </QueryClientProvider>,
  );

describe("Page", () => {
  beforeEach(() => {
    tableOptions.value = undefined;
  });

  // Regression for #86: pages without a table rendered blank with
  // "tableOptionsContext must be used within a Provider".
  it("renders without a TableOptionsProvider and hides the filter badge", () => {
    renderPage();

    expect(screen.getByText("Servers")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
    const badge = screen.getByTestId("filter-badge");
    expect(badge.textContent).toBe("0");
    expect(badge.className).toBe("hide");
  });

  it("shows the active filter count when table options are available", () => {
    tableOptions.value = { countOfFilters: 2 };
    renderPage();

    const badge = screen.getByTestId("filter-badge");
    expect(badge.textContent).toBe("2");
    expect(badge.className).toBe("show");
  });
});
