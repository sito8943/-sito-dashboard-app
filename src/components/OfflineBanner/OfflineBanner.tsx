import { classNames, useTranslation } from "@sito/dashboard";

// types
import { OfflineBannerProps } from "./types";

// styles
import "./styles.css";

// utils
import { readNavigatorOnline } from "./utils";

/**
 * Shows a global banner when the app is offline.
 * @param props - Online status and visual override props.
 * @returns Banner element or null when online.
 */
export function OfflineBanner(props: OfflineBannerProps) {
  const { t } = useTranslation();
  const { isOnline, message, className } = props;
  const resolvedIsOnline = isOnline ?? readNavigatorOnline();

  if (resolvedIsOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames("offline-banner", className)}
    >
      {message ??
        t("_accessibility:network.offline", {
          defaultValue: "You are offline",
        })}
    </div>
  );
}
