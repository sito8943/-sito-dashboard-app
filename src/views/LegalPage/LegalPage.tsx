import { classNames } from "@sito/dashboard";

import type { LegalPagePropsType } from "./types";

import "./styles.css";

/**
 * Legal page shell. Renders a `<main>` with a title, optional intro slot,
 * and a `children` slot for composable section/card primitives like
 * `LegalSection` + `LegalLinksList`. Library is i18n-agnostic — consumer
 * resolves `<Trans>` / `t()` and passes ReactNode in.
 */
export const LegalPage = (props: LegalPagePropsType) => {
  const { title, intro, children, className, titleClassName, introClassName } =
    props;

  return (
    <main className={classNames("legal-page", className)}>
      <h2 className={classNames("legal-page-title", titleClassName)}>
        {title}
      </h2>
      {intro ? (
        <div className={classNames("legal-page-intro", introClassName)}>
          {intro}
        </div>
      ) : null}
      {children}
    </main>
  );
};
