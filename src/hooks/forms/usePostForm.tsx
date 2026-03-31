import { useCallback, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "@sito/dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// providers
import { useNotification } from "providers";

// lib
import {
  NotificationEnumType,
  NotificationType,
  ValidationError,
  isValidationError,
  isHttpError,
} from "lib";

// types
import { UseFormPropsType } from "hooks";
import { FormPropsType } from "components";

/**
 * Creates a mutation-backed form handler with notification-aware errors.
 * @param props - Post form configuration.
 * @returns Form handlers and mutation loading state.
 */
export const usePostForm = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
>(
  props: UseFormPropsType<TDto, TMutationDto, TMutationOutputDto, TFormType>,
): FormPropsType<TFormType> => {
  const { t } = useTranslation();
  const {
    showStackNotifications,
    showSuccessNotification,
    showErrorNotification,
  } = useNotification();
  const queryClient = useQueryClient();

  const {
    defaultValues,
    mutationFn,
    formToDto,
    onError,
    onSuccess,
    queryKey,
    onSuccessMessage,
  } = props;

  const { control, handleSubmit, reset, setError, getValues, setValue } =
    useForm<TFormType>({
      defaultValues,
    });

  const formScopeRef = useRef<HTMLFormElement | null>(null);

  const captureFormScope = useCallback(() => {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) {
      formScopeRef.current = null;
      return;
    }
    formScopeRef.current = activeElement.closest("form");
  }, []);

  const parseFormError = useCallback(
    (error: ValidationError) => {
      const valError = error?.errors;
      const messages: string[] = [];
      const formScope = formScopeRef.current;
      if (!formScope) return messages;

      let hasFocused = false;
      if (valError) {
        valError.forEach(([key, message]) => {
          const input = formScope.querySelector(`[name="${key}"]`);
          if (
            input instanceof HTMLInputElement ||
            input instanceof HTMLTextAreaElement ||
            input instanceof HTMLSelectElement
          ) {
            if (!hasFocused) {
              input.focus();
              hasFocused = true;
            }
            input.classList.add("error");
            messages.push(t(`_entities:${queryKey}.${key}.${message}`));
          }
        });
      }
      return messages;
    },
    [t, queryKey],
  );

  const releaseFormError = useCallback(() => {
    const formScope = formScopeRef.current;
    if (!formScope) return;

    const inputs = formScope.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.remove("error");
    });
  }, []);

  const formFn = useMutation<TMutationOutputDto, ValidationError, TMutationDto>(
    {
      mutationFn,
      onError: (error: ValidationError) => {
        console.error(error);
        const unknownErr = error as unknown;

        if (onError) onError(error);
        else {
          if (isValidationError(unknownErr)) {
            const messages = parseFormError(unknownErr);
            showStackNotifications(
              messages.map(
                (message) =>
                  ({
                    message,
                    type: NotificationEnumType.error,
                  }) as NotificationType,
              ),
            );
          } else if (isHttpError(unknownErr)) {
            const fallback =
              unknownErr.message || t("_accessibility:errors.500");
            const translated = t(`_accessibility:errors.${unknownErr.status}`);
            showErrorNotification({ message: translated || fallback });
          } else
            showErrorNotification({ message: t("_accessibility:errors.500") });
        }
      },
      onSuccess: async (result) => {
        await queryClient.invalidateQueries({ queryKey });
        if (onSuccess) onSuccess(result);
        if (onSuccessMessage)
          showSuccessNotification({
            message: onSuccessMessage,
          } as NotificationType);
      },
    },
  );

  return {
    control,
    getValues,
    setValue,
    handleSubmit,
    onSubmit: (data) => {
      captureFormScope();
      releaseFormError();
      formFn.mutate(
        formToDto ? formToDto(data) : (data as unknown as TMutationDto),
      );
    },
    reset,
    setError,
    isLoading: formFn.isPending,
  };
};
