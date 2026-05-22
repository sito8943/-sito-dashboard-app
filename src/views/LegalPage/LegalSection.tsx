import { classNames } from "@sito/dashboard";

import type { LegalSectionPropsType } from "./types";

import "./styles.css";

/**
 * Card primitive used inside `LegalPage` (or anywhere a titled rounded card
 * with a body slot is needed). Pairs with `LegalLinksList` and arbitrary
 * `<Trans>`/`<p>` children resolved by the consumer.
 */
export const LegalSection = (props: LegalSectionPropsType) => {
  const { title, children, className, titleClassName, bodyClassName } = props;

  return (
    <article className={classNames("legal-section", className)}>
      <h3 className={classNames("legal-section-title", titleClassName)}>
        {title}
      </h3>
      <div className={classNames("legal-section-body", bodyClassName)}>
        {children}
      </div>
    </article>
  );
};
