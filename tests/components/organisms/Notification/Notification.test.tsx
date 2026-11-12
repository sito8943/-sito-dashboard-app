import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Notification } from "@/components/organisms/Notification";

describe("Notification (deprecated)", () => {
  it("renders nothing", () => {
    const { container } = render(<Notification />);

    expect(container).toBeEmptyDOMElement();
    expect(document.body.querySelector(".notification-portal")).toBeNull();
  });
});
