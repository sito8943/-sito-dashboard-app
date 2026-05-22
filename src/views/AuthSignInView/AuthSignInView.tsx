import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, Loading } from "@sito/dashboard";

import { AuthFormShell, type AuthFormFieldDefinitionType } from "components";
import { useConfig } from "providers";

import type { AuthSignInViewFormType, AuthSignInViewPropsType } from "./types";

export const AuthSignInView = (props: AuthSignInViewPropsType) => {
  const {
    title,
    emailLabel,
    passwordLabel,
    submitLabel,
    emailRequiredMessage,
    passwordRequiredMessage,
    rememberLabel,
    submitAriaLabel,
    signUpQuestion,
    signUpLabel,
    signUpTo,
    recoveryQuestion,
    recoveryLabel,
    recoveryTo,
    guestLabel,
    guestAriaLabel,
    onSubmit,
    onStartAsGuest,
    onError,
    ...screenProps
  } = props;

  const { linkComponent: Link } = useConfig();

  const { control, handleSubmit, formState, setError } =
    useForm<AuthSignInViewFormType>({
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
      },
    });

  const fields = useMemo<
    AuthFormFieldDefinitionType<AuthSignInViewFormType>[]
  >(() => {
    const fieldDefinitions: AuthFormFieldDefinitionType<AuthSignInViewFormType>[] =
      [
        {
          kind: "text",
          name: "email",
          id: "sign-in-email",
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
          id: "sign-in-password",
          label: passwordLabel,
          required: true,
          rules: passwordRequiredMessage
            ? { required: passwordRequiredMessage }
            : undefined,
        },
      ];

    if (rememberLabel) {
      fieldDefinitions.push({
        kind: "checkbox",
        name: "rememberMe",
        id: "rememberMe",
        label: rememberLabel,
        containerClassName: "ml-1",
      });
    }

    return fieldDefinitions;
  }, [
    emailLabel,
    emailRequiredMessage,
    passwordLabel,
    passwordRequiredMessage,
    rememberLabel,
  ]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      onError?.(error, { setError });
    }
  });

  const helperLinks = (
    <>
      {signUpQuestion && signUpLabel && signUpTo && (
        <p className="auth-form-helper-text">
          {signUpQuestion}
          <Link to={signUpTo} className="auth-form-helper-link">
            {signUpLabel}
          </Link>
        </p>
      )}
      {recoveryQuestion && recoveryLabel && recoveryTo && (
        <p className="auth-form-helper-text">
          {recoveryQuestion}
          <Link to={recoveryTo} className="auth-form-helper-link">
            {recoveryLabel}
          </Link>
        </p>
      )}
    </>
  );

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
              color="stroke-base"
              loaderClass="auth-loading-icon"
              className="auth-loading"
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
