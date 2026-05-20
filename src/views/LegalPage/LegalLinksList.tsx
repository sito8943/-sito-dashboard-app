import { classNames } from "@sito/dashboard";

import { useConfig } from "providers";

import type { LegalLinksListPropsType } from "./types";

import "./styles.css";

/**
 * Bulleted list of links. Navigation routes through `linkComponent` from
 * `ConfigProvider` so the list stays router-agnostic.
 */
export const LegalLinksList = (props: LegalLinksListPropsType) => {
  const { links, className, itemClassName, linkClassName } = props;
  const { linkComponent: Link } = useConfig();

  if (!links.length) return null;

  return (
    <ul className={classNames("legal-links-list", className)}>
      {links.map((link) => (
        <li
          key={link.to}
          className={classNames("legal-links-list-item", itemClassName)}
        >
          <Link
            to={link.to}
            className={classNames(
              "primary legal-links-list-link",
              linkClassName,
            )}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};
