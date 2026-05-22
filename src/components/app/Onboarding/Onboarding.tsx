import { useCallback, useMemo, useState } from "react";

// components
import { TabsLayout } from "../../ui/TabsLayout";
import { Step } from "./Step";

// providers
import { useConfig, useOptionalAuthContext } from "providers";

// lib
import { APP_ROUTES } from "lib";

// styles
import "./styles.css";

// types
import { OnboardingPropsType } from "./types";

// utils
import { mergeOnboardingFlag, mergeOnboardingIcons } from "./utils";

/**
 * Renders the onboarding flow using controlled TabsLayout steps.
 * @param props - Onboarding props.
 * @returns Onboarding element.
 */
export const Onboarding = (props: OnboardingPropsType) => {
  const {
    steps,
    signInPath = APP_ROUTES.AUTH_SIGN_IN,
    guestPath = APP_ROUTES.ROOT,
    onSkip,
    onSignIn,
    onStartAsGuest,
    remountStepOnChange = false,
    icons,
    alwaysShowIcon,
    alwaysHideLabel,
    showLabelOnMobile,
  } = props;

  const auth = useOptionalAuthContext();
  const { navigate } = useConfig();

  const [currentStep, setCurrentStep] = useState(1);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
      return;
    }
    navigate(signInPath);
  }, [navigate, onSkip, signInPath]);

  const handleSignIn = useCallback(() => {
    if (onSignIn) {
      onSignIn();
      return;
    }
    navigate(signInPath);
  }, [navigate, onSignIn, signInPath]);

  const handleStartAsGuest = useCallback(() => {
    if (onStartAsGuest) {
      onStartAsGuest();
      return;
    }
    auth?.setGuestMode(true);
    navigate(guestPath);
  }, [auth, guestPath, navigate, onStartAsGuest]);

  const onboardingSteps = useMemo(() => {
    return steps.map((step, i) => {
      const id = i + 1;
      const {
        icons: stepIcons,
        alwaysShowIcon: stepAlwaysShowIcon,
        alwaysHideLabel: stepAlwaysHideLabel,
        showLabelOnMobile: stepShowLabelOnMobile,
        ...stepRest
      } = step;
      return {
        id,
        label: "",
        content: (
          <Step
            key={remountStepOnChange ? id : undefined}
            {...stepRest}
            final={i === steps.length - 1}
            onClickNext={() => setCurrentStep((prev) => prev + 1)}
            onClickBack={
              i > 0 ? () => setCurrentStep((prev) => prev - 1) : undefined
            }
            onSkip={handleSkip}
            onStartAsGuest={handleStartAsGuest}
            onSignIn={handleSignIn}
            icons={mergeOnboardingIcons(icons, stepIcons)}
            alwaysShowIcon={mergeOnboardingFlag(
              alwaysShowIcon,
              stepAlwaysShowIcon,
            )}
            alwaysHideLabel={mergeOnboardingFlag(
              alwaysHideLabel,
              stepAlwaysHideLabel,
            )}
            showLabelOnMobile={mergeOnboardingFlag(
              showLabelOnMobile,
              stepShowLabelOnMobile,
            )}
          />
        ),
      };
    });
  }, [
    handleSignIn,
    handleSkip,
    handleStartAsGuest,
    remountStepOnChange,
    steps,
    icons,
    alwaysShowIcon,
    alwaysHideLabel,
    showLabelOnMobile,
  ]);

  return (
    <div className="onboarding-main">
      <TabsLayout
        currentTab={currentStep}
        onTabChange={(id) => setCurrentStep(Number(id))}
        tabs={onboardingSteps}
        useLinks={false}
        className="onboarding-tab-main"
        tabsContainerClassName="onboarding-tab-container"
      />
    </div>
  );
};
