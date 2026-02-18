import { ReactNode } from "react";
import { ActionType } from "@sito/dashboard";

// types
import { BaseEntityDto } from "lib";
import { IconButtonPropsType } from "components/Buttons/types";

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
  extends Partial<ActionType<TRow>>,
    Partial<Omit<IconButtonPropsType, "icon" | "onClick">> {}

export type PageHeaderPropsType<TRow extends BaseEntityDto> = {
  title?: string;
  actions?: ActionType<TRow>[];
  showBackButton?: boolean;
};
