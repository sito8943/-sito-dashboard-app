import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";

import { useDialog } from "./useDialog";
import {
  FormDialogErrorPhase,
  UseFormDialogPropsType,
  UseFormDialogReturnType,
} from "./types";

export const useFormDialog = <
  TFormType extends FieldValues,
  TMappedValues = TFormType,
>(
  props: UseFormDialogPropsType<TFormType, TMappedValues>,
): UseFormDialogReturnType<TFormType> => {
  const {
    closeOnSubmit = true,
    defaultValues,
    mapIn,
    mapOut,
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

  const { open, handleClose, handleOpen } = useDialog();

  const { control, handleSubmit, reset, setError, getValues, setValue } =
    useForm<TFormType>({
      defaultValues: defaultValues || ({} as DefaultValues<TFormType>),
    });

  useEffect(() => {
    if (!open) {
      initializedOpenRef.current = false;
      return;
    }

    if (initializedOpenRef.current) return;
    initializedOpenRef.current = true;

    if (reinitializeOnOpen && mapIn) {
      reset(mapIn());
      return;
    }

    if (reinitializeOnOpen && defaultValues) {
      reset(defaultValues);
      return;
    }

    if (resetOnOpen) {
      reset(defaultValues || ({} as DefaultValues<TFormType>));
    }
  }, [defaultValues, mapIn, open, reinitializeOnOpen, reset, resetOnOpen]);

  const close = useCallback(() => {
    handleClose();
    reset();
  }, [handleClose, reset]);

  const openDialog = useCallback(
    (nextId?: number) => {
      setId(nextId);
      handleOpen();
    },
    [handleOpen],
  );

  const mapCoreValues = useCallback(
    (values: TFormType): TMappedValues => {
      if (mapOut) return mapOut(values, { id });
      return values as unknown as TMappedValues;
    },
    [id, mapOut],
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
