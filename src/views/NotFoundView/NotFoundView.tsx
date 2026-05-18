import { classNames } from "@sito/dashboard";

import { useConfig } from "providers";

import { NotFoundViewPropsType } from "./types";

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
    <main
      className={classNames(
        "w-full h-full flex flex-col items-center justify-center gap-6 p-4 text-center",
        className,
      )}
    >
      <h2
        className={classNames(
          "appear text-3xl max-xs:text-2xl !text-bg-error",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <p
        className={classNames("appear text-text-muted max-w-xl", bodyClassName)}
      >
        {body}
      </p>
      <Link
        to={ctaTo}
        className={classNames(
          "appear button primary submit !px-10",
          ctaClassName,
        )}
      >
        {ctaLabel}
      </Link>
    </main>
  );
};
