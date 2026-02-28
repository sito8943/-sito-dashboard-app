import { DetailedHTMLProps, HTMLAttributes } from "react";
import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

// @sito-dashboard
import { ActionType } from "@sito/dashboard";

// lib
import { BaseEntityDto } from "lib";

export type EmptyPropsType<TRow extends BaseEntityDto> = {
  message?: string;
  messageProps?: DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  action?: ActionType<TRow>;
  iconProps?: FontAwesomeIconProps;
};
