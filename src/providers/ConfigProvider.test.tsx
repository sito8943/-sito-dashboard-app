import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "./ConfigProvider";
import { useConfig } from "./useConfig";

import type { BaseLinkPropsType } from "components/types";
import { APP_ROUTES, type Location } from "lib";

const mockLocation: Location = {
  pathname: APP_ROUTES.NOTES,
  search: "",
  hash: "",
};

const LinkComponent = ({ to, children, ...props }: BaseLinkPropsType) => {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};

const Consumer = () => {
  const config = useConfig();

  return (
    <>
      <span data-testid="pathname">{config.location.pathname}</span>
      <button
        type="button"
        onClick={() => config.navigate(APP_ROUTES.CATEGORIES)}
      >
        navigate
      </button>
    </>
  );
};

describe("ConfigProvider", () => {
  it("provides config values to descendants", () => {
    const navigate = vi.fn();

    render(
      <ConfigProvider
        location={mockLocation}
        navigate={navigate}
        linkComponent={LinkComponent}
      >
        <Consumer />
      </ConfigProvider>,
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent(APP_ROUTES.NOTES);

    fireEvent.click(screen.getByRole("button", { name: "navigate" }));
    expect(navigate).toHaveBeenCalledWith(APP_ROUTES.CATEGORIES);
  });

  it("throws when used outside ConfigProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => render(<Consumer />)).toThrow(
      "useConfig must be used within ConfigProvider",
    );

    consoleErrorSpy.mockRestore();
  });
});
