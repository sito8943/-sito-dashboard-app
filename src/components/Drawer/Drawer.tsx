import { useCallback, useEffect, useMemo } from "react";

// @sito/dashboard
import { useTranslation } from "@sito/dashboard";

//types
import { DrawerPropsTypes } from "./types";

// styles
import "./styles.css";

// providers
import { useAuth, useConfig, useDrawerMenu } from "providers";
import { SubMenuItemType } from "lib";

export function Drawer<MenuKeys>(props: DrawerPropsTypes<MenuKeys>) {
  const { t } = useTranslation();

  const { open, onClose, menuMap, logo } = props;

  const { account } = useAuth();
  const { dynamicItems } = useDrawerMenu();

  const { linkComponent } = useConfig();
  const Link = linkComponent;

  const parsedMenu = useMemo(() => {
    return menuMap.filter((item) => {
      const requiresAuth = item.auth;
      const isLoggedIn = Boolean(account?.email);

      // Include item if it doesn’t require auth, or if auth matches login status
      return (
        requiresAuth == null ||
        (requiresAuth && isLoggedIn) ||
        (!requiresAuth && !isLoggedIn)
      );
    });
  }, [account?.email, menuMap]);

  const onEscapePress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    },
    [onClose, open]
  );

  useEffect(() => {
    document.addEventListener("keydown", onEscapePress);
    return () => {
      document.removeEventListener("keydown", onEscapePress);
    };
  }, [onEscapePress]);

  const isActive = useCallback(
    (path?: string, isChild?: boolean) =>
      isChild
        ? path === `${location.pathname}${location.search}`
        : path === location.pathname,
    []
  );

  const renderChild = useCallback(
    (child: SubMenuItemType) => (
      <li
        key={child.id as string}
        className={`drawer-list-item-child ${
          isActive(child.path, true) ? "active" : ""
        } animated`}
      >
        {child.path ? (
          <Link
            aria-disabled={!open}
            to={child.path ?? "/"}
            aria-label={t(`_accessibility:ariaLabels.${child.path}`)}
            className="drawer-link"
          >
            {child.label}
          </Link>
        ) : (
          child.label
        )}
      </li>
    ),
    [Link, open, t, isActive]
  );

  const renderItems = useMemo(() => {
    return parsedMenu.map((link, i) => {
      const key = (link.page as string) ?? String(i);
      const liClass = `drawer-list-item ${
        isActive(link.path) ? "active" : ""
      } animated`;

      if (link.type === "divider") {
        return (
          <li key={key} className={liClass}>
            <hr className="drawer-divider" />
          </li>
        );
      }

      const children =
        link.children ??
        (link.page && !!dynamicItems
          ? dynamicItems[link.page as string]
          : null);

      return (
        <li key={key} className={liClass}>
          <Link
            aria-disabled={!open}
            to={link.path ?? "/"}
            aria-label={t(`_accessibility:ariaLabels.${link.path}`)}
            className="drawer-link"
          >
            {link.icon}
            {t(`_pages:${link.page}.title`)}
          </Link>
          {children && (
            <ul className="drawer-children-list">
              {children.map(renderChild)}
            </ul>
          )}
        </li>
      );
    });
  }, [Link, dynamicItems, isActive, open, parsedMenu, renderChild, t]);

  return (
    <div
      aria-label={t("_accessibility:ariaLabels.closeMenu")}
      aria-disabled={!open}
      className={`${open ? "opened" : "closed"} drawer-backdrop`}
      onClick={() => onClose()}
    >
      <aside className={`${open ? "opened" : "closed"} drawer animated`}>
        <div className="drawer-header-container">
          {logo}
          <h2 className="drawer-header poppins">{t("_pages:home.appName")}</h2>
        </div>
        <ul className="flex flex-col">{renderItems}</ul>
      </aside>
    </div>
  );
}
