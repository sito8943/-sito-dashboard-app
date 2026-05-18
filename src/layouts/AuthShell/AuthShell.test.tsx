import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthShell } from "./AuthShell";

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("components/app/Notification", () => ({
  Notification: () => <div data-testid="notification" />,
}));

describe("AuthShell", () => {
  it("renders children inside the auth-shell wrapper", () => {
    const { container } = render(
      <AuthShell>
        <span data-testid="auth-content">login form</span>
      </AuthShell>,
    );

    expect(screen.getByTestId("auth-content")).toBeTruthy();
    expect(container.querySelector(".auth-shell")).toBeTruthy();
  });

  it("renders the Notification portal by default", () => {
    render(
      <AuthShell>
        <span />
      </AuthShell>,
    );

    expect(screen.getByTestId("notification")).toBeTruthy();
  });

  it("hides the Notification portal when withNotification is false", () => {
    render(
      <AuthShell withNotification={false}>
        <span />
      </AuthShell>,
    );

    expect(screen.queryByTestId("notification")).toBeNull();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(
      <AuthShell className="custom-auth">
        <span />
      </AuthShell>,
    );

    expect(container.querySelector(".auth-shell")?.className).toContain(
      "custom-auth",
    );
  });
});
