import { faCircleCheck, faWarning } from "@fortawesome/free-solid-svg-icons";

// lib
import { NotificationEnumType } from "lib";

export const resolveNotificationType = (type?: NotificationEnumType) =>
  type ?? NotificationEnumType.error;

export const notificationIcon = (type: NotificationEnumType) => {
  switch (type) {
    case NotificationEnumType.error:
      return faWarning;
    default:
      return faCircleCheck;
  }
};

export const notificationTextColor = (type: NotificationEnumType) => {
  switch (type) {
    case NotificationEnumType.success:
      return "!text-success";
    case NotificationEnumType.error:
      return "!text-error";
    case NotificationEnumType.warning:
      return "!text-warning";
    default:
      return "!text-info";
  }
};

export const notificationBackgroundColor = (type: NotificationEnumType) => {
  switch (type) {
    case NotificationEnumType.success:
      return "bg-bg-success";
    case NotificationEnumType.error:
      return "bg-bg-error";
    case NotificationEnumType.warning:
      return "bg-bg-warning";
    default:
      return "bg-bg-info";
  }
};
