import { useCallback, useMemo, useRef } from "react";

import { useDialog } from "./useDialog";
import {
  UseFormDialogConfirmationOptions,
  UseFormDialogConfirmationReturn,
} from "./types";

/**
 * Wraps a form-dialog mutation behind a confirmation dialog.
 * When `confirmation` is set, the captured payload is held until the user
 * confirms; otherwise the hook stays inert.
 * @param options - Confirmation behavior and mutation runner.
 * @returns Capture handler and props for `ConfirmationDialog`.
 */
export const useFormDialogConfirmation = <TMutationDto,>(
  options: UseFormDialogConfirmationOptions<TMutationDto>,
): UseFormDialogConfirmationReturn<TMutationDto> => {
  const { confirmation, runMutation, onConfirmed, isMutating } = options;

  const payloadRef = useRef<TMutationDto | null>(null);
  const { open, handleOpen, handleClose } = useDialog();

  const capture = useCallback(
    (payload: TMutationDto) => {
      payloadRef.current = payload;
      handleOpen();
    },
    [handleOpen],
  );

  const close = useCallback(() => {
    handleClose();
    payloadRef.current = null;
  }, [handleClose]);

  const handleSubmit = useCallback(() => {
    const payload = payloadRef.current;
    if (!payload) return;
    void (async () => {
      try {
        await runMutation(payload);
        close();
        onConfirmed?.();
      } catch {
        // keep dialogs open so the user can retry or cancel
      }
    })();
  }, [close, onConfirmed, runMutation]);

  const confirmationProps = useMemo(() => {
    if (!confirmation) return undefined;
    return {
      open,
      title: confirmation.title,
      children: confirmation.message,
      handleClose: close,
      handleSubmit,
      isLoading: isMutating,
      extraActions: confirmation.extraActions,
    };
  }, [confirmation, open, close, handleSubmit, isMutating]);

  return {
    isEnabled: Boolean(confirmation),
    capture,
    confirmationProps,
  };
};
