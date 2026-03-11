import { useTranslation } from "@sito/dashboard";
import { scrollTo } from "some-javascript-utils/browser";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// icons
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import type { IconButtonPropsLocalType } from "./IconButton";

// hook
import { useScrollTrigger } from "hooks";

// components
import { AppIconButton } from "components";

// styles
import "./styles.css";

export type ToTopPropsType = Omit<
  IconButtonPropsLocalType,
  "icon" | "onClick"
> & {
  icon?: IconDefinition;
  threshold?: number;
  scrollTop?: number;
  scrollLeft?: number;
  tooltip?: string;
  scrollOnClick?: boolean;
  onClick?: () => void;
};

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
      className={`to-top ${isScrolled ? "show" : "hide"} ${className}`.trim()}
      data-tooltip-content={tooltip}
      {...rest}
    />
  );
};
