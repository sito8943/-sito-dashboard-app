import { ReactNode } from "react";

export type NotFoundViewPropsType = {
  title: ReactNode;
  body: ReactNode;
  ctaLabel: ReactNode;
  ctaTo: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  ctaClassName?: string;
};
