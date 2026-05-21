import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, Loading } from "@sito/dashboard";

import { AuthFormShell, type AuthFormFieldDefinitionType } from "components";
import { useUpdatePasswordFlow } from "hooks";
import { useConfig } from "providers";
import type { UpdatePasswordFormType } from "lib";

import type { AuthUpdatePasswordViewPropsType } from "./types";

export const AuthUpdatePasswordView = (
  props: AuthUpdatePasswordViewPropsType,
) => {
  const {
    authApi,
    title,
    passwordLabel,
    confirmPasswordLabel,
    submitLabel,
    submitAriaLabel,
    passwordRequiredMessage,
    confirmPasswordRequiredMessage,
    passwordMismatchMessage,
    signInQuestion,
    signInLabel,
    signInTo,
    successRedirectDelayMs,
    onSuccess,
    onInvalidToken,
    onError,
    onPasswordMismatch,
    ...screenProps
  } = props;

  const { location, navigate, linkComponent: Link } = useConfig();

  const { control, handleSubmit, setError } = useForm<UpdatePasswordFormType>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const updatePasswordFlow = useUpdatePasswordFlow({
    authApi,
    location,
    successRedirectDelayMs,
    onSuccess,
    onInvalidToken,
    onError,
    onSuccessDelayElapsed: signInTo ? () => navigate(signInTo) : undefined,
  });

  const isSubmitting = updatePasswordFlow.isSubmitting;

  const fields = useMemo<AuthFormFieldDefinitionType<UpdatePasswordFormType>[]>(
    () => [
      {
        kind: "password",
        name: "password",
        id: "update-password-password",
        label: passwordLabel,
        required: true,
        rules: passwordRequiredMessage
          ? { required: passwordRequiredMessage }
          : undefined,
      },
      {
        kind: "password",
        name: "confirmPassword",
        id: "update-password-confirm-password",
        label: confirmPasswordLabel,
        required: true,
        rules: confirmPasswordRequiredMessage
          ? { required: confirmPasswordRequiredMessage }
          : undefined,
      },
    ],
    [
      confirmPasswordLabel,
      confirmPasswordRequiredMessage,
      passwordLabel,
      passwordRequiredMessage,
    ],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    if (values.password !== values.confirmPassword) {
      if (passwordMismatchMessage) {
        setError("confirmPassword", {
          type: "manual",
          message: passwordMismatchMessage,
        });
      }
      onPasswordMismatch?.();
      return;
    }

    await updatePasswordFlow.submit(values.password);
  });

  const helperLinks =
    signInQuestion && signInLabel && signInTo ? (
      <p className="auth-form-helper-text">
        {signInQuestion}
        <Link to={signInTo} className="auth-form-helper-link">
          {signInLabel}
        </Link>
      </p>
    ) : undefined;

  const actions = useCallback(
    () => (
      <Button
        type="submit"
        variant="submit"
        color="primary"
        className="auth-submit-button"
        disabled={isSubmitting}
        aria-label={submitAriaLabel}
      >
        {isSubmitting && (
          <Loading
            color="stroke-base"
            loaderClass="auth-loading-icon"
            className="auth-loading"
            strokeWidth="6"
          />
        )}
        {submitLabel}
      </Button>
    ),
    [isSubmitting, submitAriaLabel, submitLabel],
  );

  return (
    <AuthFormShell
      title={title}
      {...screenProps}
      control={control}
      fields={fields}
      disabled={isSubmitting}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      helperLinks={helperLinks}
      actions={actions()}
    />
  );
};
