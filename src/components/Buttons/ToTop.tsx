import { classNames, useTranslation } from "@sito/dashboard";
import { scrollTo } from "some-javascript-utils/browser";

// icons
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import type { ToTopPropsType } from "./types";

// hook
import { useScrollTrigger } from "hooks";

// components
import { AppIconButton } from "components";

// styles
import "./styles.css";

/**
 * Renders a floating button that scrolls the page to a target position.
 * @param props - Visual and behavior props for the button.
 * @returns Scroll-to-top button element.
 */
export const ToTop = (props: ToTopPropsType) => {
  const { t } = useTranslation();
  const {
    icon = faArrowUp,
    threshold = 200,
    scrollTop = 0,
    scrollLeft = 0,
    tooltip = t("_accessibility:buttons.toTop"),
    scrollOnClick = true,
    onClick,
    className = "",
    variant = "submit",
    color = "primary",
    ...rest
  } = props;

  const isScrolled = useScrollTrigger(threshold);

  const handleClick = () => {
    onClick?.();
    if (scrollOnClick) {
      scrollTo(scrollLeft, scrollTop);
    }
  };

  return (
    <AppIconButton
      variant={variant}
      color={color}
      icon={icon}
      data-tooltip-id="tooltip"
      onClick={handleClick}
      className={classNames("to-top", isScrolled ? "show" : "hide", className)}
      data-tooltip-content={tooltip}
      {...rest}
    />
  );
};
