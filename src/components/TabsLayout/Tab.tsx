// types
import { TabPropsType } from "./types";

// providers
import { useConfig } from "providers/ConfigProvider";
import { Button } from "../Buttons";

export const Tab = (props: TabPropsType) => {
  const { id, active, onClick, children, to, useLinks = true, tabButtonProps } =
    props;

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
        className={`tab ${customClassName}`}
        onClick={onClick}
        {...restTabButtonProps}
      >
        {children}
      </Button>
    );
  }

  const linkClassName = `button submit tab ${
    active ? "primary" : "outlined"
  } ${tabButtonProps?.className ?? ""}`.trim();

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
