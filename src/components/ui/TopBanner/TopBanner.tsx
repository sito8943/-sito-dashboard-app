import { classNames } from "@sito/dashboard";

import type { TopBannerProps } from "./types";

import "./styles.css";

export function TopBanner(props: TopBannerProps) {
  const {
    visible = true,
    children,
    color = "default",
    role = "status",
    ariaLive = "polite",
    className,
  } = props;

  if (!visible) return null;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={classNames("top-banner", `top-banner--${color}`, className)}
    >
      {children}
    </div>
  );
}
