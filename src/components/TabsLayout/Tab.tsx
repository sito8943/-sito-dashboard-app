// @sito/dashboard
import { classNames } from "@sito/dashboard";

// types
import { TabPropsType } from "./types";

// providers
import { useConfig } from "providers";

// components
import { Button } from "../Buttons";

/**
 * Renders a single tab as either a router link or local button.
 * @param props - Tab props.
 * @returns Tab element.
 */
export const Tab = (props: TabPropsType) => {
  const {
    id,
    active,
    onClick,
    children,
    to,
    useLinks = true,
    tabButtonProps,
  } = props;

  const { linkComponent } = useConfig();

  const Link = linkComponent;

  if (!useLinks) {
    const {
      className: customClassName = "",
      variant = active ? "submit" : "outlined",
      color = active ? "primary" : "default",
      ...restTabButtonProps
    } = tabButtonProps ?? {};

    return (
      <Button
        type="button"
        variant={variant}
        color={color}
        className={classNames("tab", customClassName, active && "active")}
        onClick={onClick}
        {...restTabButtonProps}
      >
        {children}
      </Button>
    );
  }

  const linkClassName = classNames(
    "button submit tab",
    active ? "primary" : "outlined",
    tabButtonProps?.className,
  );

  return (
    <Link
      to={to ?? `#${id}`}
      onClick={() => onClick()}
      className={linkClassName}
    >
      {children}
    </Link>
  );
};
