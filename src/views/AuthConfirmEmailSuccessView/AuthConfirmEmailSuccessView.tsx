import { useCallback, useEffect, useRef } from "react";

import { AuthResultView } from "components";
import { useConfirmEmailFlow } from "hooks";
import { useConfig } from "providers";

import type { AuthConfirmEmailSuccessViewPropsType } from "./types";

export const AuthConfirmEmailSuccessView = (
  props: AuthConfirmEmailSuccessViewPropsType,
) => {
  const {
    authApi,
    title,
    description,
    toSignInLabel,
    toSignInAriaLabel,
    signInTo,
    errorTo,
    successTo,
    verifyingLabel,
    onSuccess,
    onInvalidToken,
    onError,
    onCleanUrl,
    ...screenProps
  } = props;

  const { location, navigate } = useConfig();
  const verifyStartedRef = useRef(false);

  const handleInvalidToken = useCallback(() => {
    onInvalidToken?.();
    navigate(errorTo);
  }, [errorTo, navigate, onInvalidToken]);

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error);
      navigate(errorTo);
    },
    [errorTo, navigate, onError],
  );

  const handleCleanUrl = useCallback(() => {
    onCleanUrl?.();
    if (successTo) navigate(successTo);
  }, [navigate, onCleanUrl, successTo]);

  const confirmEmailFlow = useConfirmEmailFlow({
    authApi,
    location,
    onSuccess,
    onInvalidToken: handleInvalidToken,
    onError: handleError,
    onCleanUrl: handleCleanUrl,
  });
  const { isVerifying, status, verify } = confirmEmailFlow;

  useEffect(() => {
    if (verifyStartedRef.current) return;
    if (status !== "idle") return;
    verifyStartedRef.current = true;
    void verify();
  }, [status, verify]);

  return (
    <AuthResultView
      title={title}
      description={description}
      {...screenProps}
      loading={isVerifying}
      loadingLabel={verifyingLabel}
      primaryAction={{
        children: toSignInLabel,
        ariaLabel: toSignInAriaLabel,
        onClick: () => navigate(signInTo),
      }}
    />
  );
};
