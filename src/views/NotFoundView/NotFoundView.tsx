import { classNames, useTranslation } from "@sito/dashboard";

import { useConfig } from "providers";

import { NotFoundViewPropsType } from "./types";
import {
  NOT_FOUND_DEFAULT_CTA_TO,
  NOT_FOUND_TRANSLATION_KEYS,
} from "./constants";

import "./styles.css";

/**
 * Generic 404 view. Texts default to `_pages:notFound.{title,body,cta}` and the
 * CTA to `/`; pass props to override them. Navigation uses `linkComponent` from
 * `ConfigProvider`.
 */
export const NotFoundView = (props: NotFoundViewPropsType) => {
  const {
    title,
    body,
    ctaLabel,
    ctaTo,
    className,
    titleClassName,
    bodyClassName,
    ctaClassName,
  } = props;

  const { linkComponent: Link } = useConfig();
  const { t } = useTranslation();

  return (
    <main className={classNames("not-found-view", className)}>
      <h2 className={classNames("appear not-found-view-title", titleClassName)}>
        {title ?? t(NOT_FOUND_TRANSLATION_KEYS.title)}
      </h2>
      <p className={classNames("appear not-found-view-body", bodyClassName)}>
        {body ?? t(NOT_FOUND_TRANSLATION_KEYS.body)}
      </p>
      <Link
        to={ctaTo ?? NOT_FOUND_DEFAULT_CTA_TO}
        className={classNames(
          "appear button primary submit not-found-view-cta",
          ctaClassName,
        )}
      >
        {ctaLabel ?? t(NOT_FOUND_TRANSLATION_KEYS.cta)}
      </Link>
    </main>
  );
};
