import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { ToastProvider } from "@sito/ui";

// constants
import {
  DEFAULT_NOTIFICATION_MAX,
  DEFAULT_NOTIFICATION_PLACEMENT,
  DEFAULT_NOTIFICATION_VARIANT,
} from "./constants";

// hooks
import { useNotificationLabels } from "./useNotificationLabels";

// components
import { NotificationBridge } from "./NotificationBridge";

// types
import type { NotificationProviderProps } from "./types";

// styles
import "./styles.css";

/**
 * Provides `useNotification()` and renders `@sito/ui` toasts. Toasts stack
 * (up to `max`, default 3), auto-dismiss after `duration` (default 5000ms) and
 * errors stay until dismissed. No `<Notification />` is needed.
 * @param props - Provider props and `@sito/ui` toast options.
 * @returns Toast provider with the notification context.
 */
export function NotificationProvider(props: NotificationProviderProps) {
  const {
    children,
    placement = DEFAULT_NOTIFICATION_PLACEMENT,
    variant = DEFAULT_NOTIFICATION_VARIANT,
    duration,
    max = DEFAULT_NOTIFICATION_MAX,
    label,
    closeLabel,
    viewportClassName,
    toastClassName,
  } = props;

  const labels = useNotificationLabels({ label, closeLabel });

  return (
    <ToastProvider
      placement={placement}
      variant={variant}
      duration={duration}
      max={max}
      label={labels.label}
      closeLabel={labels.closeLabel}
      closeIcon={<FontAwesomeIcon icon={faClose} />}
      viewportClassName={viewportClassName}
      toastClassName={toastClassName}
    >
      <NotificationBridge max={Math.max(1, max)}>{children}</NotificationBridge>
    </ToastProvider>
  );
}
