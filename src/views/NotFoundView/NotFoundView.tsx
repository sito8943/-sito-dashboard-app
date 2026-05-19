import { classNames } from "@sito/dashboard";

import { useConfig } from "providers";

import { NotFoundViewPropsType } from "./types";

import "./styles.css";

/**
 * Generic 404 view. Consumer provides text + CTA target.
 * Navigation uses `linkComponent` from `ConfigProvider`.
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

  return (
    <main className={classNames("not-found-view", className)}>
      <h2 className={classNames("appear not-found-view-title", titleClassName)}>
        {title}
      </h2>
      <p className={classNames("appear not-found-view-body", bodyClassName)}>
        {body}
      </p>
      <Link
        to={ctaTo}
        className={classNames(
          "appear button primary submit not-found-view-cta",
          ctaClassName,
        )}
      >
        {ctaLabel}
      </Link>
    </main>
  );
};
