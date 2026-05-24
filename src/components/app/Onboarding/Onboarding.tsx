import { useCallback, useMemo, useState } from "react";
import { useDrag } from "@use-gesture/react";

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
    alwaysHideIcon,
    alwaysHideLabel,
    showLabelOnMobile,
  } = props;

  const auth = useOptionalAuthContext();
  const { navigate } = useConfig();

  const [currentStep, setCurrentStep] = useState(1);
  const maxStep = Math.max(steps.length, 1);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, maxStep));
  }, [maxStep]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const bindSwipe = useDrag(
    ({ swipe: [swipeX] }) => {
      if (swipeX < 0) {
        goToNextStep();
        return;
      }

      if (swipeX > 0) {
        goToPreviousStep();
      }
    },
    {
      axis: "x",
      filterTaps: true,
      swipe: {
        distance: 50,
        duration: 500,
        velocity: 0.2,
      },
    },
  );

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
        alwaysHideIcon: stepAlwaysHideIcon,
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
            onClickNext={goToNextStep}
            onClickBack={i > 0 ? goToPreviousStep : undefined}
            onSkip={handleSkip}
            onStartAsGuest={handleStartAsGuest}
            onSignIn={handleSignIn}
            icons={mergeOnboardingIcons(icons, stepIcons)}
            alwaysShowIcon={mergeOnboardingFlag(
              alwaysShowIcon,
              stepAlwaysShowIcon,
            )}
            alwaysHideIcon={mergeOnboardingFlag(
              alwaysHideIcon,
              stepAlwaysHideIcon,
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
    goToNextStep,
    goToPreviousStep,
    remountStepOnChange,
    steps,
    icons,
    alwaysShowIcon,
    alwaysHideIcon,
    alwaysHideLabel,
    showLabelOnMobile,
  ]);

  return (
    <div className="onboarding-main" {...bindSwipe()}>
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
