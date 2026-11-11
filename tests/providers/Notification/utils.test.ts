import { describe, expect, it } from "vitest";
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { NotificationEnumType } from "@/lib";
import {
  getNotificationIcon,
  resolveNotificationType,
  toToastColor,
  toToastId,
} from "@/providers/Notification/utils";

describe("Notification utils", () => {
  it.each([
    [NotificationEnumType.success, "success"],
    [NotificationEnumType.error, "error"],
    [NotificationEnumType.warning, "warning"],
    [NotificationEnumType.info, "info"],
    [undefined, "error"],
  ])("maps type %s to toast color %s", (type, color) => {
    expect(toToastColor(type)).toBe(color);
  });

  it("treats a missing type as an error", () => {
    expect(resolveNotificationType()).toBe(NotificationEnumType.error);
    expect(resolveNotificationType(NotificationEnumType.info)).toBe(
      NotificationEnumType.info,
    );
  });

  it.each([
    [NotificationEnumType.success, faCircleCheck],
    [NotificationEnumType.info, faCircleInfo],
    [NotificationEnumType.warning, faTriangleExclamation],
    [NotificationEnumType.error, faTriangleExclamation],
    [undefined, faTriangleExclamation],
  ])("picks the icon for type %s", (type, icon) => {
    expect(getNotificationIcon(type)).toBe(icon);
  });

  it("builds prefixed toast ids", () => {
    expect(toToastId("p", 4)).toBe("p-4");
  });
});
