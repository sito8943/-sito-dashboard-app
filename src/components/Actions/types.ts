import { ActionType } from "@sito/dashboard";
import { BaseEntityDto } from "lib";
import { ReactNode } from "react";

export type ActionsContainerPropsType<TRow extends BaseEntityDto> = {
  actions: ActionPropsType<TRow>[];
  className?: string;
  showActionTexts?: boolean;
  showTooltips?: boolean;
};

export interface ActionPropsType<TRow extends BaseEntityDto>
  extends ActionType<TRow> {
  children?: ReactNode;
  showText?: boolean;
  showTooltips?: boolean;
}
