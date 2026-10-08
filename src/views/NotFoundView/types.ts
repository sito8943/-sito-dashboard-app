import { ReactNode } from "react";

export type NotFoundViewPropsType = {
  /** Defaults to `t("_pages:notFound.title")`. */
  title?: ReactNode;
  /** Defaults to `t("_pages:notFound.body")`. */
  body?: ReactNode;
  /** Defaults to `t("_pages:notFound.cta")`. */
  ctaLabel?: ReactNode;
  /** Defaults to `"/"`. */
  ctaTo?: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  ctaClassName?: string;
};
