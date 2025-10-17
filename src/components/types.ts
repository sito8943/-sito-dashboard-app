import { HTMLAttributes } from "react";

export type BaseSearchModalPropsType = {
  open: boolean;
  onClose: () => void;
};

export interface BaseLinkPropsType extends HTMLAttributes<HTMLAnchorElement> {
  to: string;
}
