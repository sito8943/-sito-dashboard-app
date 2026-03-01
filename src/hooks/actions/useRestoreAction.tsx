import { useCallback } from "react";
import { ActionType, useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseMultipleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

export const useRestoreAction = (props: UseMultipleActionPropTypes<number>) => {
  const { t } = useTranslation();

  const {
    onClick,
    sticky = true,
    hidden = false,
    disabled = false,
    multiple = false,
    icon = faRotateLeft,
    id = GlobalActions.Restore,
    tooltip = t("_pages:common.actions.restore.text"),
  } = props;

  const action = useCallback(
    (record: BaseEntityDto): ActionType<BaseEntityDto> => ({
      id,
      sticky,
      tooltip,
      multiple,
      onClick: () => onClick([record?.id]),
      hidden: !record.deletedAt || hidden,
      disabled: !record.deletedAt || disabled,
      icon: <FontAwesomeIcon className="text-bg-error" icon={icon} />,
      onMultipleClick: (rows) => onClick(rows.map((row) => row.id)),
    }),
    [disabled, hidden, icon, id, multiple, onClick, sticky, tooltip],
  );

  return {
    action,
  };
};
