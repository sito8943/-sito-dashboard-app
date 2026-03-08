import { ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

type ErrorIconPropsType = Omit<FontAwesomeIconProps, "icon"> & {
  icon?: FontAwesomeIconProps["icon"];
};

export type ErrorDefaultPropsType = {
  error?: Error | null;
  message?: string;
  iconProps?: ErrorIconPropsType | null;
  onRetry?: () => void;
  retryLabel?: string;
  retryButtonProps?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  messageProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >;
  className?: string;
  resetErrorBoundary?: () => void;
  children?: never;
};

export type ErrorCustomContentPropsType = {
  children: ReactNode;
  className?: string;
  error?: never;
  message?: never;
  iconProps?: never;
  onRetry?: never;
  retryLabel?: never;
  retryButtonProps?: never;
  messageProps?: never;
  resetErrorBoundary?: never;
};

export type ErrorPropsType = ErrorDefaultPropsType | ErrorCustomContentPropsType;
