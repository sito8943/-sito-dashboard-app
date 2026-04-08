import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ComponentType } from "react";

// lib
import { classNames } from "@sito/dashboard";

// types
import type { BaseLinkPropsType } from "components/types";
import type { BottomNavigationItemType } from "./types";

type NavLinkPropsType<TId extends string = string> = {
  item: BottomNavigationItemType<TId>;
  isActive: boolean;
  linkComponent: ComponentType<BaseLinkPropsType>;
};

/**
 * NavLink component that renders a navigation item for the bottom navigation bar.
 */
export const NavLink = <TId extends string = string>({
  item,
  isActive,
  linkComponent: Link,
}: NavLinkPropsType<TId>) => {
  const baseClassName =
    "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors";
  const stateClassName = isActive ? "text-hover-primary" : "text-text-muted/60";
  const className = classNames(baseClassName, stateClassName);
  const ariaLabel = item.ariaLabel ?? item.label;

  if (item.disabled) {
    return (
      <span
        className={classNames(className, "opacity-50 cursor-not-allowed")}
        aria-disabled
      >
        <span className="text-lg">
          <FontAwesomeIcon icon={item.icon} />
        </span>
        <span className="text-[10px] leading-tight">{item.label}</span>
      </span>
    );
  }

  return (
    <Link to={item.to} className={className} aria-label={ariaLabel}>
      <span className="text-lg">
        <FontAwesomeIcon icon={item.icon} />
      </span>
      <span className="text-[10px] leading-tight">{item.label}</span>
    </Link>
  );
};
