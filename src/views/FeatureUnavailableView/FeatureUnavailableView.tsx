import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

import { classNames } from "@sito/dashboard";

import { useConfig } from "providers";

import { FeatureUnavailableViewPropsType } from "./types";

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
    <main
      className={classNames(
        "w-full h-full flex flex-col items-center justify-center gap-6 px-4 text-center",
        className,
      )}
    >
      <FontAwesomeIcon
        icon={icon}
        className={classNames("text-5xl text-warning", iconClassName)}
      />
      <h2 className={classNames("text-3xl max-xs:text-2xl", titleClassName)}>
        {title}
      </h2>
      <p className={classNames("text-text-muted max-w-xl", bodyClassName)}>
        {body}
      </p>
      <Link
        to={ctaTo}
        className={classNames("button primary submit !px-10", ctaClassName)}
      >
        {ctaLabel}
      </Link>
    </main>
  );
};
