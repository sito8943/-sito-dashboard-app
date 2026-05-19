import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

import { classNames } from "@sito/dashboard";

import { useConfig } from "providers";

import { FeatureUnavailableViewPropsType } from "./types";

import "./styles.css";

/**
 * Generic "feature disabled" fallback view. Consumer provides text + CTA target;
 * navigation uses `linkComponent` from `ConfigProvider`.
 */
export const FeatureUnavailableView = (
  props: FeatureUnavailableViewPropsType,
) => {
  const {
    title,
    body,
    ctaLabel,
    ctaTo,
    icon = faWarning,
    className,
    iconClassName,
    titleClassName,
    bodyClassName,
    ctaClassName,
  } = props;

  const { linkComponent: Link } = useConfig();

  return (
    <main className={classNames("feature-unavailable-view", className)}>
      <FontAwesomeIcon
        icon={icon}
        className={classNames("feature-unavailable-view-icon", iconClassName)}
      />
      <h2
        className={classNames("feature-unavailable-view-title", titleClassName)}
      >
        {title}
      </h2>
      <p className={classNames("feature-unavailable-view-body", bodyClassName)}>
        {body}
      </p>
      <Link
        to={ctaTo}
        className={classNames(
          "button primary submit feature-unavailable-view-cta",
          ctaClassName,
        )}
      >
        {ctaLabel}
      </Link>
    </main>
  );
};
