import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Actions } from "./Actions";

import type { ActionPropsType } from "./types";

type TestRecord = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

const makeAction = (
  overrides: Partial<ActionPropsType<TestRecord>> = {}
): ActionPropsType<TestRecord> => ({
  id: "action",
  icon: <span>icon</span>,
  tooltip: "Action",
  onClick: vi.fn(),
  ...overrides,
});

describe("Actions", () => {
  it("renders an empty list when no actions are provided", () => {
    render(<Actions actions={[]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders the correct number of visible actions", () => {
    const actions = [
      makeAction({ id: "one", tooltip: "One" }),
      makeAction({ id: "two", tooltip: "Two" }),
      makeAction({ id: "three", tooltip: "Three" }),
    ];
    render(<Actions actions={actions} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("does not render hidden actions", () => {
    const actions = [
      makeAction({ id: "visible", tooltip: "Visible" }),
      makeAction({ id: "gone", tooltip: "Gone", hidden: true }),
    ];
    render(<Actions actions={actions} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows tooltip text as button label when showActionTexts is true", () => {
    const actions = [makeAction({ tooltip: "Export data" })];
    render(<Actions actions={actions} showActionTexts />);
    expect(screen.getByText("Export data")).toBeInTheDocument();
  });

  it("disables the button when action is disabled", () => {
    const actions = [makeAction({ disabled: true })];
    render(<Actions actions={actions} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
