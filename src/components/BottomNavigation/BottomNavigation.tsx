import { useMemo } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

// components
import { AppIconButton } from "components";

// providers
import { useConfig } from "providers";

// utils
import { isPathActive, splitBottomNavigationItems } from "./utils";

// components
import { NavLink } from "./NavLink";

// types
import type {
  BottomNavigationItemType,
  BottomNavigationPropsType,
} from "./types";

/**
 * Bottom navigation component for mobile devices.
 * The navigation items are divided into left and right groups, with an optional center action.
 * Navigation is router-agnostic and uses ConfigProvider's location, navigate, and linkComponent.
 * @returns {JSX.Element} The rendered BottomNavigation component.
 */
export const BottomNavigation = <TId extends string = string>(
  props: BottomNavigationPropsType<TId>,
) => {
  const { items, centerAction, className = "", isItemActive } = props;

  const { location, navigate, linkComponent } = useConfig();

  const { leftItems, rightItems } = useMemo(
    () => splitBottomNavigationItems(items),
    [items],
  );

  const {
    hidden: centerActionHidden,
    to: centerActionTo,
    icon: centerActionIcon = faPlus,
    ariaLabel: centerActionAriaLabel = "Bottom navigation action",
    onClick: onCenterActionClick,
    variant: centerActionVariant = "submit",
    color: centerActionColor = "primary",
    className: centerActionClassName = "",
    ...centerActionProps
  } = centerAction ?? {};
  const hasCenterAction = !!centerAction && !centerActionHidden;

  const resolveIsActive = (item: BottomNavigationItemType<TId>) => {
    return isItemActive
      ? isItemActive(location.pathname, item)
      : isPathActive(location.pathname, item.to);
  };

  return (
    <nav
      className={`fixed -bottom-1 left-0 right-0 z-20 bg-base border-t border-border sm:hidden ${className}`.trim()}
    >
      <div className="flex items-center justify-around h-16">
        {leftItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={resolveIsActive(item)}
            linkComponent={linkComponent}
          />
        ))}

        {hasCenterAction && (
          <div className="flex items-center justify-center flex-1">
            <AppIconButton
              {...centerActionProps}
              type="button"
              variant={centerActionVariant}
              color={centerActionColor}
              icon={centerActionIcon}
              name={centerActionAriaLabel}
              aria-label={centerActionAriaLabel}
              onClick={(e) => {
                onCenterActionClick?.(e);
                if (!e.defaultPrevented && centerActionTo) {
                  navigate(centerActionTo);
                }
              }}
              className={`rounded-full! w-12! h-12! min-w-0! p-0! flex items-center justify-center shadow-lg -mt-4 ${
                centerActionClassName
              }`.trim()}
            />
          </div>
        )}

        {rightItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={resolveIsActive(item)}
            linkComponent={linkComponent}
          />
        ))}
      </div>
    </nav>
  );
};
