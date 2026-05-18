import { ReactNode } from "react";
import { ToTopPropsType } from "components/Buttons/types";

export type DashboardFooterPropsType = {
  copyrightText: ReactNode;
  year?: number;
  showToTop?: boolean;
  toTopProps?: Partial<ToTopPropsType>;
  bottomNavSpacing?: boolean;
  className?: string;
  textClassName?: string;
  children?: ReactNode;
};
