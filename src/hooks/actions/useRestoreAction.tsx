import { useCallback } from "react";
import { ActionType, useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseMultipleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

/**
 * Creates a restore action descriptor for soft-deleted records.
 * @param props - Restore action options.
 * @returns Action factory compatible with Actions/PrettyGrid.
 */
export const useRestoreAction = <TRow extends BaseEntityDto>(
  props: UseMultipleActionPropTypes<TRow["id"]>,
) => {
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
    className,
    iconClassName,
    labelClassName,
  } = props;

  const action = useCallback(
    (record: TRow): ActionType<TRow> => ({
      id,
      sticky,
      tooltip,
      className,
      iconClassName,
      labelClassName,
      multiple,
      onClick: () => onClick([record?.id]),
      hidden: !record.deletedAt || hidden,
      disabled: !record.deletedAt || disabled,
      icon: <FontAwesomeIcon className="text-bg-error" icon={icon} />,
      onMultipleClick: (rows) => onClick(rows.map((row) => row.id)),
    }),
    [
      className,
      disabled,
      hidden,
      icon,
      iconClassName,
      id,
      labelClassName,
      multiple,
      onClick,
      sticky,
      tooltip,
    ],
  );

  return {
    action,
  };
};
