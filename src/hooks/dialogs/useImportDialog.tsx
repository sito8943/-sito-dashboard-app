import { useState } from "react";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// hooks
import { useImportAction, usePostForm } from "hooks";

// types
import { UseImportDialogPropsType } from "./types";

export function useImportDialog(props: UseImportDialogPropsType) {
  const { t } = useTranslation();

  const { queryKey, mutationFn, entity } = props;

  const [showDialog, setShowDialog] = useState(false);

  const formProps = usePostForm({
    mutationFn,
    onSuccessMessage: t("_pages:common.actions.import.successMessage"),
    queryKey,
  });

  const { action } = useImportAction({
    onClick: () => setShowDialog(true),
  });

  return {
    ...formProps,
    open: showDialog,
    title: t("_pages:common.actions.import.dialog.title", {
      entity: t(`_pages:${entity}.title`),
    }),
    handleClose: () => setShowDialog(false),
    action,
  };
}
