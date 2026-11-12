import type { ToastProviderProps } from "@sito/ui";

import type { BasicProviderPropTypes } from "../types";

/** Toast options forwarded to `@sito/ui`'s `ToastProvider`. */
export type NotificationToastOptions = Pick<
  ToastProviderProps,
  | "placement"
  | "variant"
  | "duration"
  | "max"
  | "label"
  | "closeLabel"
  | "viewportClassName"
  | "toastClassName"
>;

/**
 * `NotificationProvider` props. All toast options are optional:
 * `placement` defaults to `"bottom-left"`, `variant` to `"filled"`, `duration`
 * to 5000ms (errors stay until dismissed) and `max` to 3 visible toasts.
 * `label` / `closeLabel` default to the translated
 * `_accessibility:labels.notifications` / `_accessibility:ariaLabels.closeNotification`.
 */
export type NotificationProviderProps = BasicProviderPropTypes &
  NotificationToastOptions;

export type NotificationLabels = {
  label: string;
  closeLabel: string;
};

export type NotificationBridgeProps = BasicProviderPropTypes & {
  /** Visible toast limit; only that many ids are tracked for removal. */
  max: number;
};
