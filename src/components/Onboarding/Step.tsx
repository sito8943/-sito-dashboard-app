import { useTranslation } from "@sito/dashboard";

// types
import { StepPropsType } from "./types";
import { Button } from "../Buttons";

// styles
import "./styles.css";

/**
 * Renders a single onboarding step with navigation actions.
 * @param props - Step props.
 * @returns Step element.
 */
export const Step = (props: StepPropsType) => {
  const {
    title,
    body,
    content,
    onClickNext,
    onSkip,
    onStartAsGuest,
    onSignIn,
    image = "",
    alt = "",
    final = false,
  } = props;

  const { t } = useTranslation();

  return (
    <div className="big-appear step-container">
      {image && <img src={image} alt={alt} />}
      {title != null && <h2 className="step-title">{title}</h2>}
      {body != null && <div className="step-body">{body}</div>}
      {content != null && <div className="step-content">{content}</div>}
      <div className="step-actions">
        {!final ? (
          <>
            <Button
              color="primary"
              className="step-button"
              variant="outlined"
              onClick={onSkip}
              aria-label={t("_accessibility:ariaLabels.skip")}
            >
              {t("_accessibility:buttons.skip")}
            </Button>
            <Button
              color="primary"
              className="step-button"
              variant="outlined"
              onClick={() => onClickNext()}
              aria-label={t("_accessibility:ariaLabels.next")}
            >
              {t("_accessibility:buttons.next")}
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              className="step-button"
              variant="outlined"
              onClick={onStartAsGuest}
              aria-label={t("_accessibility:ariaLabels.start")}
            >
              {t("_accessibility:buttons.startAsGuest")}
            </Button>
            <Button
              color="primary"
              variant="submit"
              className="step-button"
              aria-label={t("_accessibility:ariaLabels.start")}
              onClick={onSignIn}
            >
              {t("_accessibility:buttons.signIn")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
