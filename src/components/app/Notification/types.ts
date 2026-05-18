import type { NotificationType } from "lib";

export type NotificationItem = NotificationType & { closing: boolean };
