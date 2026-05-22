import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconButtonPropsType } from "@sito/dashboard";

export type IconButtonPropsLocalType = Omit<IconButtonPropsType, "icon"> & {
  icon: IconDefinition;
};

export type ToTopPropsType = Omit<
  IconButtonPropsLocalType,
  "icon" | "onClick"
> & {
  icon?: IconDefinition;
  threshold?: number;
  scrollTop?: number;
  scrollLeft?: number;
  tooltip?: string;
  scrollOnClick?: boolean;
  onClick?: () => void;
};
