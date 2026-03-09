import type { ButtonHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Onboarding } from "./Onboarding";

const { navigateMock, setGuestModeMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setGuestModeMock: vi.fn(),
}));

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

type MockLinkProps = {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  to?: string;
};

vi.mock("@sito/dashboard", () => ({
  Button: ({ children, type = "button", ...props }: MockButtonProps) => (
    <button type={type} {...props}>
      {children}
    </button>
  ),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("providers", () => ({
  useAuth: () => ({ setGuestMode: setGuestModeMock }),
  useConfig: () => ({
    navigate: navigateMock,
    linkComponent: ({ children, to = "", ...props }: MockLinkProps) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }),
}));

vi.mock("providers/ConfigProvider", () => ({
  useConfig: () => ({
    linkComponent: ({ children, to = "", ...props }: MockLinkProps) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }),
}));

describe("Onboarding", () => {
  it("renders the current step with optional custom content", () => {
    render(
      <Onboarding
        steps={[
          {
            title: "Welcome",
            body: "Intro copy",
            content: <div>Extra step content</div>,
          },
          {
            title: "Finish",
            body: "Done copy",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByText("Intro copy")).toBeInTheDocument();
    expect(screen.getByText("Extra step content")).toBeInTheDocument();
  });

  it("advances to the next step when clicking next", () => {
    render(
      <Onboarding
        steps={[
          {
            title: "Welcome",
            body: "Intro copy",
          },
          {
            title: "Finish",
            body: "Done copy",
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    );

    expect(screen.getByRole("heading", { name: "Finish" })).toBeInTheDocument();
    expect(screen.getByText("Done copy")).toBeInTheDocument();
    expect(screen.getByText("_accessibility:buttons.startAsGuest")).toBeInTheDocument();
    expect(screen.getByText("_accessibility:buttons.signIn")).toBeInTheDocument();
  });
});
