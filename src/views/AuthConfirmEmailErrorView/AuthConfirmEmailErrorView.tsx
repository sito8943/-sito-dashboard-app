import { AuthResultView } from "components";
import { useConfig } from "providers";

import type { AuthConfirmEmailErrorViewPropsType } from "./types";

export const AuthConfirmEmailErrorView = (
  props: AuthConfirmEmailErrorViewPropsType,
) => {
  const {
    title,
    description,
    resendLabel,
    resendAriaLabel,
    toSignInLabel,
    toSignInAriaLabel,
    resendTo,
    signInTo,
    logo,
    headerExtra,
    motion,
  } = props;

  const { navigate } = useConfig();

  return (
    <AuthResultView
      title={title}
      description={description}
      logo={logo}
      headerExtra={headerExtra}
      motion={motion}
      primaryAction={{
        children: resendLabel,
        ariaLabel: resendAriaLabel,
        onClick: () => navigate(resendTo),
      }}
      secondaryAction={{
        children: toSignInLabel,
        ariaLabel: toSignInAriaLabel,
        onClick: () => navigate(signInTo),
      }}
    />
  );
};
