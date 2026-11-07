import { useTranslation, classNames } from "@sito/dashboard";
import { useCallback, useEffect, useState } from "react";

// icons
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";

// types
import { NavbarPropsType } from "./types.js";

// styles
import "./styles.css";

// components
import { AppIconButton, ThemeToggle } from "@/components";

// utils
import { APP_ROUTES, isMac } from "@/lib";

// providers
import { useConfig, useOptionalTheme } from "@/providers";
import { useNavbar } from "./useNavbar.js";

/**
 * Renders the top navigation bar with menu, title and a right toolbar
 * (`rightContent` + optional search + optional theme toggle).
 * @param props - Navbar props.
 * @returns Navbar element.
 */
export function Navbar(props: NavbarPropsType) {
  const { t } = useTranslation();

  const {
    openDrawer,
    showSearch = true,
    showThemeToggle = false,
    menuButtonProps,
  } = props;

  const { searchComponent, location } = useConfig();
  const { title, rightContent } = useNavbar();
  const theme = useOptionalTheme();

  const [showDialog, setShowDialog] = useState(false);

  const openOnKeyCombination = useCallback((e: KeyboardEvent) => {
    const primary = isMac() ? e.metaKey : e.ctrlKey;
    if (primary && e.shiftKey && e.key.toLowerCase() === "f") {
      setShowDialog(true);
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", openOnKeyCombination);
    return () => {
      window.removeEventListener("keydown", openOnKeyCombination);
    };
  }, [openOnKeyCombination]);

  const Search = searchComponent;
  const canShowSearch = showSearch && !!Search;
  const canShowThemeToggle = showThemeToggle && !!theme;

  return (
    <>
      {location.pathname !== APP_ROUTES.ROOT && !!Search && (
        <Search open={showDialog} onClose={() => setShowDialog(false)} />
      )}
      <header id="header" className="header animated">
        <div className="navbar-left">
          <AppIconButton
            {...menuButtonProps}
            type={menuButtonProps?.type ?? "button"}
            icon={menuButtonProps?.icon ?? faBars}
            onClick={(e) => {
              menuButtonProps?.onClick?.(e);
              openDrawer();
            }}
            name={menuButtonProps?.name ?? t("_accessibility:buttons.openMenu")}
            aria-label={
              menuButtonProps?.["aria-label"] ??
              t("_accessibility:ariaLabels.openMenu")
            }
            className={classNames(
              "navbar-menu animated",
              menuButtonProps?.className,
            )}
          />
          <h1 className="poppins navbar-title">
            {title || t("_pages:home.appName")}
          </h1>
        </div>
        <div className="navbar-right">
          {rightContent}
          {canShowSearch && (
            <AppIconButton
              type="button"
              icon={faSearch}
              className="navbar-search-btn navbar-toolbar-btn"
              onClick={() => setShowDialog(true)}
              name={t("_accessibility:ariaLabels.search")}
              aria-label={t("_accessibility:ariaLabels.search")}
            />
          )}
          {canShowThemeToggle && (
            <ThemeToggle className="navbar-theme-toggle navbar-toolbar-btn" />
          )}
        </div>
      </header>
    </>
  );
}
