import { Button, Loading } from "@sito/dashboard";

import { AuthResultView } from "components";

import type { AuthSignUpConfirmationViewPropsType } from "./types";

export const AuthSignUpConfirmationView = (
  props: AuthSignUpConfirmationViewPropsType,
) => {
  const {
    title,
    description,
    toSignInLabel,
    toSignInAriaLabel,
    resendLabel,
    resendAriaLabel,
    isResending = false,
    onSignIn,
    onResendConfirmEmail,
    ...screenProps
  } = props;

  return (
    <AuthResultView
      title={title}
      description={description}
      {...screenProps}
      actions={
        <>
          <Button
            type="button"
            variant="submit"
            color="primary"
            className="auth-action-button"
            disabled={isResending}
            onClick={onSignIn}
            aria-label={toSignInAriaLabel}
          >
            {toSignInLabel}
          </Button>
          {resendLabel && onResendConfirmEmail && (
            <Button
              type="button"
              variant="outlined"
              className="auth-action-button"
              disabled={isResending}
              onClick={() => {
                void onResendConfirmEmail();
              }}
              aria-label={resendAriaLabel}
            >
              {isResending && (
                <Loading
                  className="auth-loading"
                  color="stroke-primary"
                  loaderClass="auth-loading-icon"
                  strokeWidth="6"
                />
              )}
              {resendLabel}
            </Button>
          )}
        </>
      }
    />
  );
};
