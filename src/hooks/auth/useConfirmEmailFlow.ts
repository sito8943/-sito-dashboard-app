import { useCallback, useState } from "react";

import {
  hasAuthErrorParamsInLocation,
  hasAuthTokenHashOrTypeParamsInLocation,
  resolveConfirmEmailDtoFromLocation,
} from "lib";

import type {
  AuthFlowStatus,
  UseConfirmEmailFlowOptions,
  UseConfirmEmailFlowResult,
} from "./types";

export const useConfirmEmailFlow = (
  options: UseConfirmEmailFlowOptions,
): UseConfirmEmailFlowResult => {
  const { authApi, location, onCleanUrl, onInvalidToken, onError, onSuccess } =
    options;

  const [status, setStatus] = useState<AuthFlowStatus>("idle");
  const [error, setError] = useState<unknown>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const verify = useCallback(async () => {
    setError(null);

    if (hasAuthErrorParamsInLocation(location.hash, location.search)) {
      setStatus("invalid_token");
      onInvalidToken?.();
      return;
    }

    const payload = resolveConfirmEmailDtoFromLocation(
      location.hash,
      location.search,
    );

    if (!payload) {
      if (
        hasAuthTokenHashOrTypeParamsInLocation(location.hash, location.search)
      ) {
        setStatus("invalid_token");
        onInvalidToken?.();
        return;
      }

      setStatus("success");
      onSuccess?.();
      return;
    }

    setStatus("verifying");

    try {
      await authApi.confirmEmail(payload);
      setStatus("success");
      onSuccess?.();

      if (location.search.length > 0 || location.hash.length > 0) {
        onCleanUrl?.();
      }
    } catch (caughtError) {
      setError(caughtError);
      setStatus("error");
      onError?.(caughtError);
    }
  }, [
    authApi,
    location.hash,
    location.search,
    onCleanUrl,
    onError,
    onInvalidToken,
    onSuccess,
  ]);

  return {
    status,
    error,
    isVerifying: status === "verifying",
    verify,
    reset,
  };
};
