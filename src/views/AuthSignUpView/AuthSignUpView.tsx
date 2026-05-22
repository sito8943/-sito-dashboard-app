import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, Loading } from "@sito/dashboard";

import { AuthFormShell, type AuthFormFieldDefinitionType } from "components";
import { useConfig } from "providers";

import type { AuthSignUpViewFormType, AuthSignUpViewPropsType } from "./types";

export const AuthSignUpView = (props: AuthSignUpViewPropsType) => {
  const {
    title,
    nameLabel,
    emailLabel,
    passwordLabel,
    confirmPasswordLabel,
    submitLabel,
    nameRequiredMessage,
    emailRequiredMessage,
    passwordRequiredMessage,
    confirmPasswordRequiredMessage,
    passwordMismatchMessage,
    submitAriaLabel,
    signInQuestion,
    signInLabel,
    signInTo,
    guestLabel,
    guestAriaLabel,
    onSubmit,
    onStartAsGuest,
    onPasswordMismatch,
    onError,
    ...screenProps
  } = props;

  const { linkComponent: Link } = useConfig();

  const { control, handleSubmit, formState, setError } =
    useForm<AuthSignUpViewFormType>({
      defaultValues: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

  const fields = useMemo<
    AuthFormFieldDefinitionType<AuthSignUpViewFormType>[]
  >(() => {
    const fieldDefinitions: AuthFormFieldDefinitionType<AuthSignUpViewFormType>[] =
      [];

    if (nameLabel) {
      fieldDefinitions.push({
        kind: "text",
        name: "name",
        id: "sign-up-name",
        type: "text",
        label: nameLabel,
        required: true,
        rules: nameRequiredMessage
          ? { required: nameRequiredMessage }
          : undefined,
      });
    }

    fieldDefinitions.push(
      {
        kind: "text",
        name: "email",
        id: "sign-up-email",
        type: "email",
        label: emailLabel,
        required: true,
        rules: emailRequiredMessage
          ? { required: emailRequiredMessage }
          : undefined,
      },
      {
        kind: "password",
        name: "password",
        id: "sign-up-password",
        label: passwordLabel,
        required: true,
        rules: passwordRequiredMessage
          ? { required: passwordRequiredMessage }
          : undefined,
      },
      {
        kind: "password",
        name: "confirmPassword",
        id: "sign-up-confirm-password",
        label: confirmPasswordLabel,
        required: true,
        rules: confirmPasswordRequiredMessage
          ? { required: confirmPasswordRequiredMessage }
          : undefined,
      },
    );

    return fieldDefinitions;
  }, [
    confirmPasswordLabel,
    confirmPasswordRequiredMessage,
    emailLabel,
    emailRequiredMessage,
    nameLabel,
    nameRequiredMessage,
    passwordLabel,
    passwordRequiredMessage,
  ]);

  const submit = handleSubmit(async (values) => {
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

    try {
      await onSubmit(values);
    } catch (error) {
      onError?.(error, { setError });
    }
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

  const isSubmitting = formState.isSubmitting;

  const actions = useCallback(
    () => (
      <>
        <Button
          type="submit"
          color="primary"
          variant="submit"
          className="auth-submit-button"
          disabled={isSubmitting}
          aria-label={submitAriaLabel}
        >
          {isSubmitting && (
            <Loading
              className="auth-loading"
              color="stroke-base"
              loaderClass="auth-loading-icon"
              strokeWidth="6"
            />
          )}
          {submitLabel}
        </Button>
        {guestLabel && onStartAsGuest && (
          <Button
            type="button"
            variant="outlined"
            disabled={isSubmitting}
            onClick={onStartAsGuest}
            aria-label={guestAriaLabel}
          >
            {guestLabel}
          </Button>
        )}
      </>
    ),
    [
      guestAriaLabel,
      guestLabel,
      isSubmitting,
      onStartAsGuest,
      submitAriaLabel,
      submitLabel,
    ],
  );

  return (
    <AuthFormShell
      title={title}
      {...screenProps}
      control={control}
      fields={fields}
      disabled={isSubmitting}
      onSubmit={(event) => {
        void submit(event);
      }}
      helperLinks={helperLinks}
      actions={actions()}
    />
  );
};
