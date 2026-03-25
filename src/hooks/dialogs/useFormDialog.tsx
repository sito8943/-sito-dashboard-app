import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "@sito/dashboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// providers
import { useNotification } from "providers";

// lib
import {
  NotificationEnumType,
  NotificationType,
  ValidationError,
  isHttpError,
  isValidationError,
} from "lib";

import { useDialog } from "./useDialog";
import {
  FormDialogMode,
  UseEntityFormDialogPropsType,
  UseFormDialogLegacyPropsType,
  UseFormDialogPropsType,
  UseFormDialogReturnType,
} from "./types";

const isLegacyFormDialogProps = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
  TMappedValues,
>(
  props: UseFormDialogPropsType<
    TDto,
    TMutationDto,
    TMutationOutputDto,
    TFormType,
    TMappedValues
  >,
): props is UseFormDialogLegacyPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType
> => "mutationFn" in props && "queryKey" in props;

export const useFormDialog = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
  TMappedValues = TFormType,
>(
  props: UseFormDialogPropsType<
    TDto,
    TMutationDto,
    TMutationOutputDto,
    TFormType,
    TMappedValues
  >,
): UseFormDialogReturnType<TFormType> => {
  const legacyMode = isLegacyFormDialogProps(props);
  const legacyProps = legacyMode ? props : undefined;
  const coreProps = !legacyMode ? props : undefined;
  const mode: FormDialogMode = legacyMode
    ? "entity"
    : (coreProps?.mode ?? "state");

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    showErrorNotification,
    showStackNotifications,
    showSuccessNotification,
  } = useNotification();

  const [id, setId] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedOpenRef = useRef(false);
  const lastHydratedDataRef = useRef<TDto>();

  const { open, handleClose, handleOpen } = useDialog();

  const { control, handleSubmit, reset, setError, getValues, setValue } =
    useForm<TFormType>({
      defaultValues:
        legacyProps?.defaultValues ||
        coreProps?.defaultValues ||
        ({} as DefaultValues<TFormType>),
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

  const legacyQueryKey = legacyProps
    ? [...legacyProps.queryKey, id ?? 0]
    : ["__legacy-form-dialog-disabled__", id ?? 0];

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      if (!legacyProps?.getFunction || !id) return undefined as TDto;
      return legacyProps.getFunction(id);
    },
    queryKey: legacyQueryKey,
    enabled: !!legacyProps?.getFunction && !!id,
  });

  useEffect(() => {
    if (!legacyProps || !data || !legacyProps.dtoToForm) return;
    if (lastHydratedDataRef.current === data) return;

    reset({ ...legacyProps.dtoToForm(data) });
    lastHydratedDataRef.current = data;
  }, [data, legacyProps, reset]);

  useEffect(() => {
    if (!coreProps) return;

    if (!open) {
      initializedOpenRef.current = false;
      return;
    }

    if (initializedOpenRef.current) return;
    initializedOpenRef.current = true;

    if (coreProps.reinitializeOnOpen && coreProps.mapIn) {
      reset(coreProps.mapIn());
      return;
    }

    if (coreProps.reinitializeOnOpen && coreProps.defaultValues) {
      reset(coreProps.defaultValues);
      return;
    }

    if (coreProps.resetOnOpen) {
      reset(coreProps.defaultValues || ({} as DefaultValues<TFormType>));
    }
  }, [coreProps, open, reset]);

  const parseFormError = useCallback(
    (error: ValidationError) => {
      const valError = error?.errors;
      const messages: string[] = [];
      const formScope = formScopeRef.current;
      if (!formScope || !legacyProps) return messages;

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
            messages.push(
              t(`_entities:${legacyProps.queryKey}.${key}.${message}`),
            );
          }
        });
      }
      return messages;
    },
    [legacyProps, t],
  );

  const releaseFormError = useCallback(() => {
    const formScope = formScopeRef.current;
    if (!formScope) return;

    const inputs = formScope.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.remove("error");
    });
  }, []);

  const close = useCallback(() => {
    releaseFormError();
    formScopeRef.current = null;
    handleClose();
    reset();
  }, [handleClose, releaseFormError, reset]);

  const openDialog = useCallback(
    (nextId?: number) => {
      setId(nextId);
      handleOpen();
    },
    [handleOpen],
  );

  const legacyMutation = useMutation<
    TMutationOutputDto,
    ValidationError,
    TMutationDto
  >({
    mutationFn: async (payload) => {
      if (!legacyProps) {
        return undefined as TMutationOutputDto;
      }
      return legacyProps.mutationFn(payload);
    },
    onError: (error: ValidationError) => {
      if (!legacyProps) return;

      if (legacyProps.onError) legacyProps.onError(error);
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
                }) as NotificationType,
            ),
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
      if (!legacyProps) return;

      await queryClient.invalidateQueries({ queryKey: legacyProps.queryKey });
      if (legacyProps.onSuccess) await legacyProps.onSuccess(result);
      showSuccessNotification({
        message: legacyProps.onSuccessMessage,
      } as NotificationType);
      close();
    },
  });

  const mapCoreValues = useCallback(
    (values: TFormType): TMappedValues => {
      if (legacyProps) return values as unknown as TMappedValues;
      if (coreProps?.mapOut) return coreProps.mapOut(values, { id });
      return values as unknown as TMappedValues;
    },
    [coreProps, id, legacyProps],
  );

  const onApply = useCallback(async () => {
    if (!coreProps?.onApply) return;

    const values = getValues();
    const mapped = mapCoreValues(values);
    setIsSubmitting(true);
    try {
      await coreProps.onApply(mapped, {
        close,
        id,
        values,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [close, coreProps, getValues, id, mapCoreValues]);

  const onClear = useCallback(async () => {
    if (!coreProps) return;

    if (coreProps.onClear) {
      setIsSubmitting(true);
      try {
        await coreProps.onClear();
      } finally {
        setIsSubmitting(false);
      }
    }

    reset(coreProps.defaultValues || ({} as DefaultValues<TFormType>));
  }, [coreProps, reset]);

  const onSubmit = useCallback(
    async (values: TFormType) => {
      if (legacyProps) {
        captureFormScope();
        legacyMutation.mutate(
          legacyProps.formToDto
            ? legacyProps.formToDto(values)
            : (values as unknown as TMutationDto),
        );
        return;
      }

      const mapped = mapCoreValues(values);
      setIsSubmitting(true);
      try {
        if (coreProps?.onSubmit) {
          await coreProps.onSubmit(mapped, {
            close,
            id,
            values,
          });
        }
        if (coreProps?.closeOnSubmit ?? true) close();
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      captureFormScope,
      close,
      coreProps,
      id,
      legacyMutation,
      legacyProps,
      mapCoreValues,
    ],
  );

  return {
    open,
    mode,
    id,
    openDialog,
    handleClose: close,
    control,
    getValues,
    setValue,
    handleSubmit,
    onSubmit,
    reset,
    setError,
    title: props.title,
    isSubmitting,
    onApply,
    onClear,
    isLoading: isLoading || legacyMutation.isPending || isSubmitting,
  };
};

/**
 * @deprecated Use `usePostDialog`/`usePutDialog` instead.
 */
export const useFormDialogLegacy = useFormDialog;

/**
 * @deprecated Use `usePostDialog`/`usePutDialog` instead.
 */
export const useEntityFormDialog = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
>(
  props: UseEntityFormDialogPropsType<
    TDto,
    TMutationDto,
    TMutationOutputDto,
    TFormType
  >,
): UseFormDialogReturnType<TFormType> => useFormDialog(props);
