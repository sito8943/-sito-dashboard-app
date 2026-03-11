import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

import { ToTop } from "./ToTop";

const { useScrollTriggerMock, scrollToMock, capturedProps } = vi.hoisted(
  () => ({
    useScrollTriggerMock: vi.fn(),
    scrollToMock: vi.fn(),
    capturedProps: { current: {} as Record<string, unknown> },
  }),
);

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("hooks", () => ({
  useScrollTrigger: useScrollTriggerMock,
}));

vi.mock("some-javascript-utils/browser", () => ({
  scrollTo: scrollToMock,
}));

vi.mock("components", () => ({
  AppIconButton: (props: Record<string, unknown>) => {
    capturedProps.current = props;
    return (
      <button
        type="button"
        data-testid="to-top-button"
        onClick={props.onClick as () => void}
      />
    );
  },
}));

describe("ToTop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScrollTriggerMock.mockReturnValue(true);
    capturedProps.current = {};
  });

  it("keeps current default behavior", () => {
    render(<ToTop />);

    expect(useScrollTriggerMock).toHaveBeenCalledWith(200);
    expect(capturedProps.current.variant).toBe("submit");
    expect(capturedProps.current.color).toBe("primary");
    expect(capturedProps.current.className).toBe("to-top show");
    expect(capturedProps.current["data-tooltip-content"]).toBe(
      "_accessibility:buttons.toTop",
    );
  });

  it("accepts custom visual and behavior props", () => {
    const onClick = vi.fn();

    useScrollTriggerMock.mockReturnValue(false);

    render(
      <ToTop
        threshold={100}
        scrollTop={20}
        scrollLeft={10}
        tooltip="Back to top"
        variant="outlined"
        color="secondary"
        className="my-top"
        icon={faArrowDown}
        onClick={onClick}
      />,
    );

    expect(useScrollTriggerMock).toHaveBeenCalledWith(100);
    expect(capturedProps.current.variant).toBe("outlined");
    expect(capturedProps.current.color).toBe("secondary");
    expect(capturedProps.current.className).toBe("to-top hide my-top");
    expect(capturedProps.current.icon).toBe(faArrowDown);
    expect(capturedProps.current["data-tooltip-content"]).toBe("Back to top");

    screen.getByTestId("to-top-button").click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollToMock).toHaveBeenCalledWith(10, 20);
  });

  it("allows disabling default scroll behavior", () => {
    const onClick = vi.fn();

    render(<ToTop scrollOnClick={false} onClick={onClick} />);

    screen.getByTestId("to-top-button").click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});
