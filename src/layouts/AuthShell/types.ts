import { ReactNode } from "react";

export type AuthShellPropsType = {
  children: ReactNode;
  withNotification?: boolean;
  className?: string;
};
