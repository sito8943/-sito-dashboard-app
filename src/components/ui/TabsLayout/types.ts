import { ReactNode } from "react";
import { ButtonPropsType } from "@sito/dashboard";

export type TabButtonPropsType = Omit<
  ButtonPropsType,
  "children" | "onClick" | "type"
>;

/** Tab id type. `currentTab` and `defaultTab` are compared against `TabsType.id`. */
export type TabId = number | string;

export type TabsLayoutPropsType<TId extends TabId = TabId> = {
  tabs: TabsType<TId>[];
  /** Id (not index) of the initially selected tab in uncontrolled mode. */
  defaultTab?: TId;
  /** Id (not index) of the active tab in controlled mode. */
  currentTab?: TId;
  onTabChange?: (id: TId) => void;
  className?: string;
  tabsContainerClassName?: string;
  useLinks?: boolean;
  tabButtonProps?: TabButtonPropsType;
};

export type TabsType<TId extends TabId = TabId> = {
  id: TId;
  label: string;
  content: ReactNode;
  to?: string;
};

export type TabPropsType = {
  children: ReactNode;
  id: TabId;
  to?: string;
  active: boolean;
  onClick: () => void;
  siblings?: boolean;
  useLinks?: boolean;
  tabButtonProps?: TabButtonPropsType;
};
