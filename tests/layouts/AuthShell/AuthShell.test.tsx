import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthShell } from "@/layouts/AuthShell/AuthShell";

vi.mock("@sito/dashboard", () => ({
  classNames: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
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

  it.each([true, false, undefined])(
    "renders only children whatever withNotification is (%s)",
    (withNotification) => {
      const { container } = render(
        <AuthShell withNotification={withNotification}>
          <span data-testid="auth-content" />
        </AuthShell>,
      );

      const ids = Array.from(
        container.querySelector(".auth-shell")?.children ?? [],
      ).map((node) => node.getAttribute("data-testid"));
      expect(ids).toEqual(["auth-content"]);
    },
  );

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
