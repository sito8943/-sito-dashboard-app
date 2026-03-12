import { useCallback, useMemo, useState } from "react";

// components
import { TabsLayout } from "../TabsLayout";
import { Step } from "./Step";

// providers
import { useAuth, useConfig } from "providers";

// styles
import "./styles.css";

// types
import { OnboardingPropsType } from "./types";

export const Onboarding = (props: OnboardingPropsType) => {
  const {
    steps,
    signInPath = "/auth/sign-in",
    guestPath = "/",
    onSkip,
    onSignIn,
    onStartAsGuest,
  } = props;

  const { setGuestMode } = useAuth();
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
    setGuestMode(true);
    navigate(guestPath);
  }, [guestPath, navigate, onStartAsGuest, setGuestMode]);

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
