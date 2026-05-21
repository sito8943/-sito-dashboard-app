import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, classNames, Loading } from "@sito/dashboard";

import { AuthFormShell, type AuthFormFieldDefinitionType } from "components";
import { useConfig } from "providers";

import type { RecoveryFormType } from "lib";
import type {
  AuthRecoveryViewActionType,
  AuthRecoveryViewPropsType,
} from "./types";

export const AuthRecoveryView = (props: AuthRecoveryViewPropsType) => {
  const {
    title,
    description,
    statusMessage,
    statusMessageVariant = "default",
    statusMessageClassName,
    emailLabel,
    submitLabel,
    emailRequiredMessage,
    submitAriaLabel,
    signInQuestion,
    signInLabel,
    signInTo,
    secondaryActionLabel,
    secondaryActionAriaLabel,
    onSubmit,
    onSecondaryAction,
    onError,
    ...screenProps
  } = props;

  const { linkComponent: Link } = useConfig();
  const { headerExtra, ...authScreenProps } = screenProps;
  const [loadingAction, setLoadingAction] =
    useState<AuthRecoveryViewActionType | null>(null);

  const { control, handleSubmit, setError } = useForm<RecoveryFormType>({
    defaultValues: {
      email: "",
    },
  });

  const fields = useMemo<AuthFormFieldDefinitionType<RecoveryFormType>[]>(
    () => [
      {
        kind: "text",
        name: "email",
        id: "recovery-email",
        type: "email",
        label: emailLabel,
        required: true,
        rules: emailRequiredMessage
          ? { required: emailRequiredMessage }
          : undefined,
      },
    ],
    [emailLabel, emailRequiredMessage],
  );

  const submit = handleSubmit(async (values) => {
    setLoadingAction("submit");
    try {
      await onSubmit(values);
    } catch (error) {
      onError?.(error, { action: "submit", setError });
    } finally {
      setLoadingAction(null);
    }
  });

  const secondarySubmit = handleSubmit(async (values) => {
    if (!onSecondaryAction) return;

    setLoadingAction("secondary");
    try {
      await onSecondaryAction(values);
    } catch (error) {
      onError?.(error, { action: "secondary", setError });
    } finally {
      setLoadingAction(null);
    }
  });

  const helperLinks = (
    <>
      {statusMessage && (
        <p
          className={classNames(
            "auth-form-status-message",
            statusMessageVariant === "success" &&
              "auth-form-status-message--success",
            statusMessageVariant === "error" &&
              "auth-form-status-message--error",
            statusMessageClassName,
          )}
        >
          {statusMessage}
        </p>
      )}
      {signInQuestion && signInLabel && signInTo && (
        <p className="auth-form-helper-text">
          {signInQuestion}
          <Link to={signInTo} className="auth-form-helper-link">
            {signInLabel}
          </Link>
        </p>
      )}
    </>
  );

  const renderedHeaderExtra = (
    <>
      {description && <p className="auth-form-description">{description}</p>}
      {headerExtra}
    </>
  );

  const isLoading = loadingAction !== null;

  const actions = useCallback(
    () => (
      <>
        <Button
          type="submit"
          color="primary"
          variant="submit"
          className="auth-submit-button"
          disabled={isLoading}
          aria-label={submitAriaLabel}
        >
          {loadingAction === "submit" && (
            <Loading
              color="stroke-base"
              loaderClass="auth-loading-icon"
              className="auth-loading"
              strokeWidth="6"
            />
          )}
          {submitLabel}
        </Button>
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            type="button"
            variant="outlined"
            disabled={isLoading}
            onClick={() => {
              void secondarySubmit();
            }}
            aria-label={secondaryActionAriaLabel}
          >
            {loadingAction === "secondary" && (
              <Loading
                color="stroke-primary"
                loaderClass="auth-loading-icon"
                className="auth-loading"
                strokeWidth="6"
              />
            )}
            {secondaryActionLabel}
          </Button>
        )}
      </>
    ),
    [
      isLoading,
      loadingAction,
      onSecondaryAction,
      secondaryActionAriaLabel,
      secondaryActionLabel,
      secondarySubmit,
      submitAriaLabel,
      submitLabel,
    ],
  );

  return (
    <AuthFormShell
      title={title}
      {...authScreenProps}
      headerExtra={renderedHeaderExtra}
      control={control}
      fields={fields}
      disabled={isLoading}
      onSubmit={(event) => {
        void submit(event);
      }}
      helperLinks={helperLinks}
      actions={actions()}
    />
  );
};
