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
      variant="submit"
      color="primary"
      icon={faArrowUp}
      data-tooltip-id="tooltip"
      onClick={() => scrollTo(0, 0)}
      className={`to-top ${isScrolled ? "show" : "hide"}`}
      data-tooltip-content={t("_accessibility:buttons.toTop")}
    />
  );
};
