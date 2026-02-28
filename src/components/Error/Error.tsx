import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";

// types
import { ErrorPropsType } from "./types";

// styles
import "./styles.css";

export function Error(props: ErrorPropsType) {
  const { error } = props;
  const { t } = useTranslation();

  return (
    <div className="error-container">
      <FontAwesomeIcon icon={faSadTear} className="error-icon" />
      <p className="error-message">
        {error?.message ?? t("_accessibility:errors.unknownError")}
      </p>
    </div>
  );
}
