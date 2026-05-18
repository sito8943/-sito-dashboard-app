import { classNames } from "@sito/dashboard";

import { ToTop } from "components/Buttons";

import { DASHBOARD_FOOTER_CLASSNAMES } from "./constants";
import { DashboardFooterPropsType } from "./types";

/**
 * Shared dashboard footer: copyright line and optional `ToTop`.
 * Mount `bottomNavSpacing` when the app also renders `BottomNavigation`.
 */
export const DashboardFooter = (props: DashboardFooterPropsType) => {
  const {
    copyrightText,
    year = new Date().getFullYear(),
    showToTop = true,
    toTopProps,
    bottomNavSpacing = false,
    className,
    textClassName,
    children,
  } = props;

  return (
    <footer
      className={classNames(
        DASHBOARD_FOOTER_CLASSNAMES.root,
        bottomNavSpacing && DASHBOARD_FOOTER_CLASSNAMES.withBottomNavSpacing,
        className,
      )}
    >
      {children ?? (
        <p
          className={classNames(
            DASHBOARD_FOOTER_CLASSNAMES.text,
            textClassName,
          )}
        >
          {copyrightText} {year}
        </p>
      )}
      {showToTop && <ToTop {...toTopProps} />}
    </footer>
  );
};
