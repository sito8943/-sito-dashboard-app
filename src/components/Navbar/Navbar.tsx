import { useTranslation } from "@sito/dashboard";
import { useCallback, useEffect, useState } from "react";

// icons
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";

// types
import { NavbarPropsType } from "./types.js";

// styles
import "./styles.css";

// clock
import { Clock } from "./Clock";

// components
import { AppIconButton } from "components";

// utils
import { isMac } from "lib";

// providers
import { useConfig } from "providers";

export function Navbar(props: NavbarPropsType) {
  const { t } = useTranslation();

  const {
    openDrawer,
    showClock = true,
    showSearch = true,
    menuButtonProps,
  } = props;

  const { searchComponent, location } = useConfig();

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

  return (
    <>
      {location.pathname !== "/" && !!Search && (
        <Search open={showDialog} onClose={() => setShowDialog(false)} />
      )}
      <header id="header" className="header">
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
            className={`navbar-menu animated ${menuButtonProps?.className ?? ""}`}
          />
          <h1 className="poppins navbar-title">{t("_pages:home.appName")}</h1>
        </div>
        <div className="navbar-right">
          {showSearch && (
            <AppIconButton
              icon={faSearch}
              className="min-md:!hidden"
              onClick={() => setShowDialog(true)}
            />
          )}
          {showClock && <Clock />}
        </div>
      </header>
    </>
  );
}
