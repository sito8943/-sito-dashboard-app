import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconButtonPropsLocalType } from "components/Buttons/IconButton";

export type BottomNavigationPositionType = "left" | "right";

export type BottomNavigationItemType<TId extends string = string> = {
  id: TId;
  to: string;
  icon: IconDefinition;
  label: string;
  ariaLabel?: string;
  position?: BottomNavigationPositionType;
  hidden?: boolean;
  disabled?: boolean;
};

export type BottomNavigationCenterActionType = Omit<
  IconButtonPropsLocalType,
  "icon" | "onClick" | "name"
> & {
  hidden?: boolean;
  icon?: IconDefinition;
  to?: string;
  ariaLabel?: string;
  onClick?: IconButtonPropsLocalType["onClick"];
};

export type BottomNavigationPropsType<TId extends string = string> = {
  items: BottomNavigationItemType<TId>[];
  centerAction?: BottomNavigationCenterActionType | null;
  className?: string;
  isItemActive?: (
    pathname: string,
    item: BottomNavigationItemType<TId>,
  ) => boolean;
};
