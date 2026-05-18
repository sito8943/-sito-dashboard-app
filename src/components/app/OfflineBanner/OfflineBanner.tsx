import { useTranslation } from "@sito/dashboard";

import { TopBanner } from "../../ui/TopBanner";

import type { OfflineBannerProps } from "./types";
import { readNavigatorOnline } from "./utils";

export function OfflineBanner(props: OfflineBannerProps) {
  const { t } = useTranslation();
  const { isOnline, message, className } = props;
  const resolvedIsOnline = isOnline ?? readNavigatorOnline();

  return (
    <TopBanner
      visible={!resolvedIsOnline}
      color="warning"
      className={className}
    >
      {message ??
        t("_accessibility:network.offline", {
          defaultValue: "You are offline",
        })}
    </TopBanner>
  );
}
