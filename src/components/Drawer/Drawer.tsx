import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "@sito/dashboard";

//types
import { DrawerPropsTypes } from "./types";

// styles
import "./styles.css";

// providers
import { useAuth, useConfig } from "providers";

export function Drawer<MenuKeys>(props: DrawerPropsTypes<MenuKeys>) {
  const { t } = useTranslation();

  const { open, onClose, menuMap, logo } = props;

  const { account } = useAuth();

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
  }, [account]);

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

  return (
    <div
      aria-label={t("_accessibility:ariaLabels.closeMenu")}
      aria-disabled={!open}
      className={`${open ? "opened" : "closed"} drawer-backdrop`}
      onClick={() => onClose()}
    >
      <aside
        className={`${open ? "opened" : "closed"} drawer animated`}
      >
        <div className="drawer-header-container">
          {logo}
          <h2 className="drawer-header poppins">
            {t("_pages:home.appName")}
          </h2>
        </div>
        <ul className="flex flex-col">
          {parsedMenu.map((link, i) => (
            <li
              key={`${link.page ?? i}`}
              className={`drawer-list-item ${
                link.path === location.pathname ? "active" : ""
              } animated`}
            >
              {link.type !== "divider" && Link ? (
                <Link
                  aria-disabled={!open}
                  to={link.path ?? `/${link.path}`}
                  aria-label={t(`_accessibility:ariaLabels.${link.path}`)}
                  className="drawer-link"
                >
                  {link.icon}
                  {t(`_pages:${link.page}.title`)}
                </Link>
              ) : (
                <hr className="drawer-divider" />
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
