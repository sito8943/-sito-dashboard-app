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

  const { open, onClose, menuMap } = props;

  const { account } = useAuth();

  const { linkComponent } = useConfig();

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
        className={`${open ? "opened" : "closed"} bg-base drawer animated`}
      >
        <h2 className="text-xl text-text px-5 pb-5 font-bold poppins">
          {t("_pages:home.appName")}
        </h2>
        <ul className="flex flex-col">
          {parsedMenu.map((link, i) => (
            <li
              key={`${link.page ?? i}`}
              className={`w-full flex hover:bg-base-light ${
                link.path === location.pathname ? "bg-base-light" : ""
              } animated`}
            >
              {link.type !== "divider" && linkComponent ? (
                <linkComponent.type
                  aria-disabled={!open}
                  to={link.path ?? `/${link.path}`}
                  aria-label={t(`_accessibility:ariaLabels.${link.path}`)}
                  className="text-lg text-text-muted w-full py-2 px-5 flex items-center justify-start gap-2"
                >
                  {link.icon}
                  {t(`_pages:${link.page}.title`)}
                </linkComponent.type>
              ) : (
                <hr className="border-border border-spacing-x-0.5 w-full" />
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
