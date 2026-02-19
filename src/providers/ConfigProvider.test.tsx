import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider, useConfig } from "./ConfigProvider";

import type { BaseLinkPropsType } from "components/types";
import type { Location } from "lib";

const mockLocation: Location = {
  pathname: "/dashboard",
  search: "",
  hash: "",
  state: null,
  key: "default",
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
      <button type="button" onClick={() => config.navigate("/users")}>
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
      </ConfigProvider>
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent("/dashboard");

    fireEvent.click(screen.getByRole("button", { name: "navigate" }));
    expect(navigate).toHaveBeenCalledWith("/users");
  });

  it("throws when used outside ConfigProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => render(<Consumer />)).toThrow(
      "Config provider has not been set."
    );

    consoleErrorSpy.mockRestore();
  });
});
