import type { ReactNode } from "react";

export interface LegalPagePropsType {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  introClassName?: string;
}

export interface LegalSectionPropsType {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

export type LegalContentSectionType = {
  title: string;
  body: string;
};

export interface LegalLink {
  to: string;
  label: ReactNode;
}

export interface LegalLinksListPropsType {
  links: LegalLink[];
  className?: string;
  itemClassName?: string;
  linkClassName?: string;
}
