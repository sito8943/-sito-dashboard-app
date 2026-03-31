import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";

import { useDialog } from "./useDialog";
import {
  FormDialogErrorPhase,
  OpenFormDialogParamsType,
  UseFormDialogPropsType,
  UseFormDialogReturnType,
} from "./types";

/** Handles reusable form-dialog lifecycle, mapping and submit orchestration. */
export const useFormDialog = <
  TFormType extends FieldValues,
  TMappedValues = TFormType,
>(
  props: UseFormDialogPropsType<TFormType, TMappedValues>,
): UseFormDialogReturnType<TFormType> => {
  const {
    closeOnSubmit = true,
    defaultValues,
    dtoToForm,
    formToDto,
    mode = "state",
    onApply: onApplyProp,
    onClear: onClearProp,
    onError: onErrorProp,
    onSubmit: onSubmitProp,
    reinitializeOnOpen,
    resetOnOpen,
    title,
  } = props;

  const [id, setId] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedOpenRef = useRef(false);
  const openValuesRef = useRef<DefaultValues<TFormType> | null>(null);

  const { open, handleClose, handleOpen } = useDialog();

  const { control, handleSubmit, reset, setError, getValues, setValue } =
    useForm<TFormType>({
      defaultValues: defaultValues || ({} as DefaultValues<TFormType>),
    });

  useEffect(() => {
    if (!open) {
      initializedOpenRef.current = false;
      openValuesRef.current = null;
      return;
    }

    if (initializedOpenRef.current) return;
    initializedOpenRef.current = true;

    if (openValuesRef.current) {
      reset(openValuesRef.current);
      openValuesRef.current = null;
      return;
    }

    const dtoToFormMapper = dtoToForm;
    if (reinitializeOnOpen && dtoToFormMapper) {
      const sourceValues = defaultValues || ({} as DefaultValues<TFormType>);
      reset(dtoToFormMapper(sourceValues));
      return;
    }

    if (reinitializeOnOpen && defaultValues) {
      reset(defaultValues);
      return;
    }

    if (resetOnOpen) {
      reset(defaultValues || ({} as DefaultValues<TFormType>));
    }
  }, [defaultValues, dtoToForm, open, reinitializeOnOpen, reset, resetOnOpen]);

  const close = useCallback(() => {
    handleClose();
    reset();
  }, [handleClose, reset]);

  const openDialog = useCallback(
    (params?: number | OpenFormDialogParamsType<TFormType>) => {
      let nextId: number | undefined;
      let nextValues: DefaultValues<TFormType> | undefined;

      if (typeof params === "number" || params == null) {
        nextId = params;
      } else {
        nextId = params.id;
        nextValues = params.values;
      }

      setId(nextId);
      if (nextValues) {
        if (open) {
          reset(nextValues);
        } else {
          openValuesRef.current = nextValues;
        }
      } else {
        openValuesRef.current = null;
      }

      if (!open) {
        handleOpen();
      }
    },
    [handleOpen, open, reset],
  );

  const mapCoreValues = useCallback(
    (values: TFormType): TMappedValues => {
      const formToDtoMapper = formToDto;
      if (formToDtoMapper) return formToDtoMapper(values, { id });
      return values as unknown as TMappedValues;
    },
    [formToDto, id],
  );

  const handleCoreError = useCallback(
    async (
      error: unknown,
      phase: FormDialogErrorPhase,
      values: TFormType,
    ): Promise<void> => {
      if (!onErrorProp) return;
      await onErrorProp(error, {
        close,
        id,
        phase,
        values,
      });
    },
    [close, id, onErrorProp],
  );

  const onApply = useCallback(async () => {
    if (!onApplyProp) return;

    const values = getValues();
    setIsSubmitting(true);
    try {
      const mapped = mapCoreValues(values);
      await onApplyProp(mapped, {
        close,
        id,
        values,
      });
    } catch (error) {
      await handleCoreError(error, "apply", values).catch(() => undefined);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [close, getValues, handleCoreError, id, mapCoreValues, onApplyProp]);

  const onClear = useCallback(async () => {
    const values = getValues();

    if (onClearProp) {
      setIsSubmitting(true);
      try {
        await onClearProp();
      } catch (error) {
        await handleCoreError(error, "clear", values).catch(() => undefined);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }

    try {
      reset(defaultValues || ({} as DefaultValues<TFormType>));
    } catch (error) {
      await handleCoreError(error, "clear", values).catch(() => undefined);
      throw error;
    }
  }, [defaultValues, getValues, handleCoreError, onClearProp, reset]);

  const onSubmit = useCallback(
    async (values: TFormType) => {
      setIsSubmitting(true);
      try {
        const mapped = mapCoreValues(values);
        if (onSubmitProp) {
          await onSubmitProp(mapped, {
            close,
            id,
            values,
          });
        }
        if (closeOnSubmit) close();
      } catch (error) {
        await handleCoreError(error, "submit", values).catch(() => undefined);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [close, closeOnSubmit, handleCoreError, id, mapCoreValues, onSubmitProp],
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
    title,
    isSubmitting,
    onApply,
    onClear,
    isLoading: isSubmitting,
  };
};
