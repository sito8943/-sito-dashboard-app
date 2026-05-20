import { useCallback, useEffect, useRef, useState } from "react";

import { resolveResetPasswordDtoFromLocation } from "lib";

import type {
  AuthFlowStatus,
  UseUpdatePasswordFlowOptions,
  UseUpdatePasswordFlowResult,
} from "./types";
import { DEFAULT_SUCCESS_REDIRECT_DELAY_MS } from "./constants";

export const useUpdatePasswordFlow = (
  options: UseUpdatePasswordFlowOptions,
): UseUpdatePasswordFlowResult => {
  const {
    authApi,
    location,
    successRedirectDelayMs = DEFAULT_SUCCESS_REDIRECT_DELAY_MS,
    onSuccess,
    onSuccessDelayElapsed,
    onInvalidToken,
    onError,
  } = options;

  const [status, setStatus] = useState<AuthFlowStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRedirectTimeout = useCallback(() => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const reset = useCallback(() => {
    clearRedirectTimeout();
    setStatus("idle");
    setError(null);
  }, [clearRedirectTimeout]);

  const submit = useCallback(
    async (newPassword: string) => {
      clearRedirectTimeout();
      setError(null);

      const payload = resolveResetPasswordDtoFromLocation(
        location.hash,
        location.search,
        newPassword,
      );

      if (!payload) {
        setStatus("invalid_token");
        onInvalidToken?.();
        return;
      }

      setStatus("submitting");

      try {
        await authApi.resetPassword(payload);
        setStatus("success");
        onSuccess?.();

        if (onSuccessDelayElapsed) {
          timeoutRef.current = setTimeout(
            onSuccessDelayElapsed,
            successRedirectDelayMs,
          );
        }
      } catch (caughtError) {
        setError(caughtError);
        setStatus("error");
        onError?.(caughtError);
      }
    },
    [
      authApi,
      clearRedirectTimeout,
      location.hash,
      location.search,
      onError,
      onInvalidToken,
      onSuccess,
      onSuccessDelayElapsed,
      successRedirectDelayMs,
    ],
  );

  useEffect(() => clearRedirectTimeout, [clearRedirectTimeout]);

  return {
    status,
    error,
    isSubmitting: status === "submitting",
    submit,
    reset,
  };
};
