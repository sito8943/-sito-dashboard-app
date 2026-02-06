import { useCallback, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "@sito/dashboard";
import { useMutation, useQuery } from "@tanstack/react-query";

// providers
import { queryClient, useNotification } from "providers";

// lib
import {
  NotificationEnumType,
  NotificationType,
  ValidationError,
  isValidationError,
  isHttpError,
} from "lib";

// hooks
import { useDialog } from "hooks";

// types
import { UseFormDialogPropsType, TriggerFormDialogPropsType } from "hooks";

export const useFormDialog = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
>(
  props: UseFormDialogPropsType<
    TDto,
    TMutationDto,
    TMutationOutputDto,
    TFormType
  >
): TriggerFormDialogPropsType<TFormType, ValidationError> => {
  const { t } = useTranslation();
  const {
    showErrorNotification,
    showStackNotifications,
    showSuccessNotification,
  } = useNotification();

  const {
    defaultValues,
    getFunction,
    mutationFn,
    formToDto,
    dtoToForm,
    onError,
    onSuccess,
    queryKey,
    onSuccessMessage,
    title,
  } = props;

  const [id, setId] = useState(0);

  const { open, handleClose, handleOpen } = useDialog();

  const { control, handleSubmit, reset, setError, getValues, setValue } =
    useForm<TFormType>({
      defaultValues,
    });

  const { data, isLoading } = useQuery({
    queryFn: () => getFunction?.(id),
    queryKey: [...queryKey, id],
    enabled: !!getFunction && !!queryKey && !!id,
  });

  useEffect(() => {
    if (data && dtoToForm) reset({ ...dtoToForm(data) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const parseFormError = useCallback(
    (error: ValidationError) => {
      const valError = error?.errors;
      const messages: string[] = [];
      if (valError) {
        valError.forEach(([key, message]) => {
          const input = document.querySelector(`[name="${key}"]`);
          if (
            input instanceof HTMLInputElement ||
            input instanceof HTMLTextAreaElement ||
            input instanceof HTMLSelectElement
          ) {
            input.focus();
            input.classList.add("error");
            messages.push(t(`_entities:${queryKey}.${key}.${message}`));
          }
        });
      }
      return messages;
    },
    [t, queryKey]
  );

  const releaseFormError = useCallback(() => {
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.remove("error");
    });
  }, []);

  const onClick = useCallback(
    (id?: number) => {
      setId(id ?? 0);
      handleOpen();
    },
    [handleOpen]
  );

  const close = useCallback(() => {
    releaseFormError();
    handleClose();
    reset();
  }, [reset, releaseFormError, handleClose]);

  const dialogFn = useMutation<
    TMutationOutputDto,
    ValidationError,
    TMutationDto
  >({
    mutationFn,
    onError: (error: ValidationError) => {
      console.error(error);
      if (onError) onError(error);
      else {
        const unknownErr = error as unknown;
        if (isValidationError(unknownErr)) {
          const messages = parseFormError(unknownErr);
          showStackNotifications(
            messages.map(
              (message) =>
                ({
                  message,
                  type: NotificationEnumType.error,
                }) as NotificationType
            )
          );
        } else if (isHttpError(unknownErr)) {
          const fallback = unknownErr.message || t("_accessibility:errors.500");
          const translated = t(`_accessibility:errors.${unknownErr.status}`);
          showErrorNotification({ message: translated || fallback });
        } else {
          showErrorNotification({ message: t("_accessibility:errors.500") });
        }
      }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey });
      if (onSuccess) onSuccess(result);
      showSuccessNotification({
        message: onSuccessMessage,
      } as NotificationType);
      close();
    },
  });

  return {
    open,
    openDialog: onClick,
    handleClose: close,
    control,
    getValues,
    setValue,
    handleSubmit,
    onSubmit: (data) => dialogFn.mutate(formToDto(data)),
    reset,
    setError,
    parseFormError,
    releaseFormError,
    title,
    isLoading: isLoading || dialogFn.isPending,
  };
};
