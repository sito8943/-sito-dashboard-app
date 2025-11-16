import { ReactNode } from "react";
import { ActionType } from "@sito/dashboard";

// types
import { BaseEntityDto } from "lib";

export type PagePropsType<TRow extends BaseEntityDto> = {
  title?: string;
  children: ReactNode;
  isLoading?: boolean;
  addOptions?: Partial<ActionType<TRow>>;
  filterOptions?: Partial<ActionType<TRow>>;
  isAnimated?: boolean;
  actions?: ActionType<TRow>[];
  showBackButton?: boolean;
  queryKey?: string[];
};

export type PageHeaderPropsType<TRow extends BaseEntityDto> = {
  title?: string;
  actions?: ActionType<TRow>[];
  showBackButton?: boolean;
};
