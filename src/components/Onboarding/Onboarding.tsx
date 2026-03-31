import { useCallback, useMemo, useState } from "react";

// components
import { TabsLayout } from "../TabsLayout";
import { Step } from "./Step";

// providers
import { useConfig, useOptionalAuthContext } from "providers";

// styles
import "./styles.css";

// types
import { OnboardingPropsType } from "./types";

/**
 * Renders the onboarding flow using controlled TabsLayout steps.
 * @param props - Onboarding props.
 * @returns Onboarding element.
 */
export const Onboarding = (props: OnboardingPropsType) => {
  const {
    steps,
    signInPath = "/auth/sign-in",
    guestPath = "/",
    onSkip,
    onSignIn,
    onStartAsGuest,
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
    return steps.map((step, i) => ({
      id: i + 1,
      label: "",
      content: (
        <Step
          {...step}
          final={i === steps.length - 1}
          onClickNext={() => setCurrentStep((prev) => prev + 1)}
          onSkip={handleSkip}
          onStartAsGuest={handleStartAsGuest}
          onSignIn={handleSignIn}
        />
      ),
    }));
  }, [handleSignIn, handleSkip, handleStartAsGuest, steps]);

  return (
    <div className="onboarding-main">
      <TabsLayout
        currentTab={currentStep}
        onTabChange={(id) => setCurrentStep(Number(id))}
        tabs={onboardingSteps}
        useLinks={false}
      />
    </div>
  );
};
