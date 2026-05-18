import { ReactNode } from "react";
import { ActionType } from "@sito/dashboard";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// types
import { BaseEntityDto } from "lib";
import { IconButtonPropsType } from "@sito/dashboard";

export type PagePropsType<TRow extends BaseEntityDto> = {
  title?: string;
  children: ReactNode;
  isLoading?: boolean;
  addOptions?: PageAddOptions<TRow>;
  filterOptions?: Partial<ActionType<TRow>>;
  isAnimated?: boolean;
  actions?: ActionType<TRow>[];
  showBackButton?: boolean;
  queryKey?: string[];
};

export interface PageAddOptions<TRow extends BaseEntityDto>
  extends Partial<Omit<ActionType<TRow>, "icon">>,
    Partial<Omit<IconButtonPropsType, "icon" | "onClick">> {
  icon?: IconDefinition;
}

export type PageHeaderPropsType<TRow extends BaseEntityDto> = {
  title?: string;
  actions?: ActionType<TRow>[];
  showBackButton?: boolean;
};
