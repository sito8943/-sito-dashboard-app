import { useTranslation } from "@sito/dashboard";

// components
import { Button } from "../../ui/Buttons";
import { StepButtonContent } from "./StepButtonContent";

// types
import { OnboardingActionKey, StepPropsType } from "./types";

// utils
import { buildStepButtonClassName, resolveOnboardingIcon } from "./utils";

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
    onClickBack,
    onSkip,
    onStartAsGuest,
    onSignIn,
    image = "",
    alt = "",
    final = false,
    icons,
    alwaysShowIcon,
    alwaysHideIcon,
    alwaysHideLabel,
    showLabelOnMobile,
  } = props;

  const { t } = useTranslation();

  const iconFor = (action: OnboardingActionKey) =>
    resolveOnboardingIcon(icons, action);

  const classFor = (action: OnboardingActionKey) =>
    buildStepButtonClassName(
      action,
      alwaysShowIcon,
      alwaysHideIcon,
      alwaysHideLabel,
      showLabelOnMobile,
    );

  return (
    <div className="big-appear step-container">
      {image && <img src={image} alt={alt} />}
      {title != null && <h2 className="step-title">{title}</h2>}
      {body != null && <div className="step-body">{body}</div>}
      {content != null && <div className="step-content">{content}</div>}
      <div className="step-actions">
        {onClickBack && (
          <Button
            color="primary"
            className={classFor("back")}
            variant="outlined"
            onClick={() => onClickBack()}
            aria-label={t("_accessibility:buttons.back")}
          >
            <StepButtonContent
              icon={iconFor("back")}
              label={t("_accessibility:buttons.back")}
            />
          </Button>
        )}
        {!final ? (
          <>
            <Button
              color="primary"
              className={classFor("skip")}
              variant="outlined"
              onClick={onSkip}
              aria-label={t("_accessibility:ariaLabels.skip")}
            >
              <StepButtonContent
                icon={iconFor("skip")}
                label={t("_accessibility:buttons.skip")}
              />
            </Button>
            <Button
              color="primary"
              className={classFor("next")}
              variant="outlined"
              onClick={() => onClickNext()}
              aria-label={t("_accessibility:ariaLabels.next")}
            >
              <StepButtonContent
                icon={iconFor("next")}
                label={t("_accessibility:buttons.next")}
              />
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              className={classFor("startAsGuest")}
              variant="outlined"
              onClick={onStartAsGuest}
              aria-label={t("_accessibility:ariaLabels.start")}
            >
              <StepButtonContent
                icon={iconFor("startAsGuest")}
                label={t("_accessibility:buttons.startAsGuest")}
              />
            </Button>
            <Button
              color="primary"
              variant="submit"
              className={classFor("signIn")}
              aria-label={t("_accessibility:ariaLabels.start")}
              onClick={onSignIn}
            >
              <StepButtonContent
                icon={iconFor("signIn")}
                label={t("_accessibility:buttons.signIn")}
              />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
