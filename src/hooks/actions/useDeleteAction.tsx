import { useCallback } from "react";
import { ActionType, useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseMultipleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

/** Creates a delete action descriptor for single and multi-row operations. */
export const useDeleteAction = (props: UseMultipleActionPropTypes<number>) => {
  const { t } = useTranslation();

  const {
    onClick,
    icon = faTrash,
    sticky = true,
    hidden = false,
    multiple = true,
    disabled = false,
    id = GlobalActions.Delete,
    tooltip = t("_pages:common.actions.delete.text"),
  } = props;

  const action = useCallback(
    (record: BaseEntityDto): ActionType<BaseEntityDto> => ({
      id,
      sticky,
      tooltip,
      multiple,
      onClick: () => onClick([record?.id]),
      hidden: !!record.deletedAt || hidden,
      disabled: !!record.deletedAt || disabled,
      icon: <FontAwesomeIcon className="text-bg-error" icon={icon} />,
      onMultipleClick: (rows) => onClick(rows.map((row) => row.id)),
    }),
    [disabled, hidden, icon, id, multiple, onClick, sticky, tooltip],
  );

  return {
    action,
  };
};
