import { ReactNode } from "react";
import { ButtonPropsType } from "@sito/dashboard";

export type TabButtonPropsType = Omit<ButtonPropsType, "children" | "onClick" | "type">;

export type TabsLayoutPropsType = {
  tabs: TabsType[];
  defaultTab?: number;
  className?: string;
  tabsContainerClassName?: string;
  useLinks?: boolean;
  tabButtonProps?: TabButtonPropsType;
};

export type TabsType = {
  id: number | string;
  label: string;
  content: ReactNode;
  to?: string;
};

export type TabPropsType = {
  children: ReactNode;
  id: number | string;
  to?: string;
  active: boolean;
  onClick: () => void;
  siblings?: boolean;
  useLinks?: boolean;
  tabButtonProps?: TabButtonPropsType;
};
