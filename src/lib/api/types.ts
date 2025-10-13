// @sito/dashboard
import { SortOrder } from "@sito/dashboard";

export type APIError = {
  kind: string;
  message: string;
};

export type QueryResult<TDto> = {
  sort: keyof TDto;
  order: "asc" | "desc";
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  items: TDto[];
};

export type QueryParam<TDto> = {
  sortingBy?: keyof TDto;
  sortingOrder?: SortOrder;
  currentPage?: number;
  pageSize?: number;
};

export type RangeValue<T> = {
  start: T;
  end: T;
};
