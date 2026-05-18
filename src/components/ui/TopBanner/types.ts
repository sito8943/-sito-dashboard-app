import type { ReactNode } from "react";

export type TopBannerColor =
  | "default"
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TopBannerAriaLive = "off" | "polite" | "assertive";

export type TopBannerProps = {
  visible?: boolean;
  children: ReactNode;
  color?: TopBannerColor;
  role?: string;
  ariaLive?: TopBannerAriaLive;
  className?: string;
};
