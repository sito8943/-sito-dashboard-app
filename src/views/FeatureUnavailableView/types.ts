import { ReactNode } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type FeatureUnavailableViewPropsType = {
  title: ReactNode;
  body: ReactNode;
  ctaLabel: ReactNode;
  ctaTo: string;
  icon?: IconDefinition;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  ctaClassName?: string;
};
