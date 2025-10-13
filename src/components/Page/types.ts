import { ReactNode } from "react";
import { Action } from "@sito/dashboard";

// types
import { BaseEntityDto } from "lib";

export type PagePropsType<TRow extends BaseEntityDto> = {
  title?: string;
  children: ReactNode;
  isLoading?: boolean;
  addOptions?: Partial<Action<TRow>>;
  filterOptions?: Partial<Action<TRow>>;
  isAnimated?: boolean;
  actions?: Action<TRow>[];
  showBackButton?: boolean;
  queryKey?: string[];
  navigate: (route: string | number) => void;
};

export type PageHeaderPropsType<TRow extends BaseEntityDto> = {
  title?: string;
  actions?: Action<TRow>[];
  showBackButton?: boolean;
  navigate: (route: string | number) => void;
};
