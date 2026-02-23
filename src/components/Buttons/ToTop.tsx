import { useTranslation } from "@sito/dashboard";
import { scrollTo } from "some-javascript-utils/browser";

// icons
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

// hook
import { useScrollTrigger } from "hooks";

// components
import { AppIconButton } from "components";

// styles
import "./styles.css";

export const ToTop = () => {
  const { t } = useTranslation();

  const isScrolled = useScrollTrigger(200);

  return (
    <AppIconButton
      icon={faArrowUp}
      onClick={() => scrollTo(0, 0)}
      data-tooltip-id="tooltip"
      data-tooltip-content={t("_accessibility:buttons.toTop")}
      className={`submit primary to-top ${isScrolled ? "show" : "hide"}`}
    />
  );
};
