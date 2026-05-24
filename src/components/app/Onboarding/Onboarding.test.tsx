import type { ButtonHTMLAttributes, ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Onboarding } from "./Onboarding";

type TestDragState = {
  swipe: [number, number];
};

type TestDragHandler = (state: TestDragState) => void;

const {
  dragHandlers,
  navigateMock,
  setGuestModeMock,
  useOptionalAuthContextMock,
} = vi.hoisted(() => ({
  dragHandlers: [] as TestDragHandler[],
  navigateMock: vi.fn(),
  setGuestModeMock: vi.fn(),
  useOptionalAuthContextMock: vi.fn(),
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
  classNames: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("@use-gesture/react", () => ({
  useDrag: (handler: TestDragHandler) => {
    dragHandlers.push(handler);
    return () => ({ "data-swipe-enabled": "true" });
  },
}));

vi.mock("providers", () => ({
  useOptionalAuthContext: () => useOptionalAuthContextMock(),
  useConfig: () => ({
    navigate: navigateMock,
    linkComponent: ({ children, to = "", ...props }: MockLinkProps) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }),
}));

describe("Onboarding", () => {
  beforeEach(() => {
    dragHandlers.length = 0;
    navigateMock.mockReset();
    setGuestModeMock.mockReset();
    useOptionalAuthContextMock.mockReturnValue({
      setGuestMode: setGuestModeMock,
    });
  });

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

    expect(
      screen.getByRole("heading", { name: "Welcome" }),
    ).toBeInTheDocument();
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
    expect(
      screen.getByText("_accessibility:buttons.startAsGuest"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("_accessibility:buttons.signIn"),
    ).toBeInTheDocument();
  });

  it("advances and goes back with horizontal swipe gestures", () => {
    render(
      <Onboarding
        steps={[
          {
            title: "Welcome",
            body: "Intro copy",
          },
          {
            title: "Details",
            body: "Middle copy",
          },
          {
            title: "Finish",
            body: "Done copy",
          },
        ]}
      />,
    );

    const handler = dragHandlers.at(-1);
    expect(handler).toBeDefined();

    act(() => {
      handler?.({ swipe: [-1, 0] });
    });

    expect(
      screen.getByRole("heading", { name: "Details" }),
    ).toBeInTheDocument();

    act(() => {
      handler?.({ swipe: [1, 0] });
    });

    expect(
      screen.getByRole("heading", { name: "Welcome" }),
    ).toBeInTheDocument();
  });

  it("uses default onboarding navigation paths when no callbacks are provided", () => {
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
      screen.getByRole("button", { name: "_accessibility:ariaLabels.skip" }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/auth/sign-in");

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    );

    fireEvent.click(screen.getByText("_accessibility:buttons.startAsGuest"));
    expect(setGuestModeMock).toHaveBeenCalledWith(true);
    expect(navigateMock).toHaveBeenCalledWith("/");

    fireEvent.click(screen.getByText("_accessibility:buttons.signIn"));
    expect(navigateMock).toHaveBeenCalledWith("/auth/sign-in");
  });

  it("uses custom onboarding callbacks when provided", () => {
    const onSkip = vi.fn();
    const onSignIn = vi.fn();
    const onStartAsGuest = vi.fn();

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
        onSkip={onSkip}
        onSignIn={onSignIn}
        onStartAsGuest={onStartAsGuest}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.skip" }),
    );
    expect(onSkip).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    );

    fireEvent.click(screen.getByText("_accessibility:buttons.startAsGuest"));
    fireEvent.click(screen.getByText("_accessibility:buttons.signIn"));

    expect(onStartAsGuest).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(setGuestModeMock).not.toHaveBeenCalled();
  });

  it("applies alwaysHideIcon globally and per step", () => {
    render(
      <Onboarding
        alwaysHideIcon={{ skip: true }}
        steps={[
          {
            title: "Welcome",
            body: "Intro copy",
          },
          {
            title: "Finish",
            body: "Done copy",
            alwaysHideIcon: true,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.skip" }),
    ).toHaveClass("step-button--hide-icon");
    expect(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    ).not.toHaveClass("step-button--hide-icon");

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    );

    for (const action of screen.getAllByRole("button", {
      name: "_accessibility:ariaLabels.start",
    })) {
      expect(action).toHaveClass("step-button--hide-icon");
    }
  });

  it("keys the active step when remountStepOnChange is enabled", () => {
    const { container } = render(
      <Onboarding
        remountStepOnChange
        steps={[
          {
            title: "Welcome",
            body: "Intro copy",
            content: <span data-testid="step-content">step-1</span>,
          },
          {
            title: "Finish",
            body: "Done copy",
            content: <span data-testid="step-content">step-2</span>,
          },
        ]}
      />,
    );

    const firstStep = container.querySelector(".step-container");
    expect(firstStep).not.toBeNull();
    expect(screen.getByTestId("step-content").textContent).toBe("step-1");

    fireEvent.click(
      screen.getByRole("button", { name: "_accessibility:ariaLabels.next" }),
    );

    const secondStep = container.querySelector(".step-container");
    expect(secondStep).not.toBeNull();
    expect(secondStep).not.toBe(firstStep);
    expect(screen.getByTestId("step-content").textContent).toBe("step-2");
  });

  it("starts as guest without auth context", () => {
    useOptionalAuthContextMock.mockReturnValue(undefined);

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
    fireEvent.click(screen.getByText("_accessibility:buttons.startAsGuest"));

    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(setGuestModeMock).not.toHaveBeenCalled();
  });
});
