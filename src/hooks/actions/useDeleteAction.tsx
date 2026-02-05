import { useCallback } from "react";
import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseMultipleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

export const useDeleteAction = (props: UseMultipleActionPropTypes<number>) => {
  const { t } = useTranslation();

  const { onClick, hidden = false, disabled = false } = props;

  const action = useCallback(
    (record: BaseEntityDto) => ({
      id: GlobalActions.Delete,
      hidden: !!record.deletedAt || hidden,
      disabled: !!record.deletedAt || disabled,
      icon: <FontAwesomeIcon className="text-red-500" icon={faTrash} />,
      tooltip: t("_pages:common.actions.delete.text"),
      onClick: () => onClick([record?.id]),
    }),
    [disabled, hidden, onClick, t]
  );

  return {
    action,
  };
};
