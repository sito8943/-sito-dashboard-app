import { useCallback } from "react";
import { useTranslation } from "@sito/dashboard";

// @sito/dashboard
import { ActionType } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseSingleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

/**
 * Creates an edit action descriptor for row-level editing flows.
 * @param props - Edit action options.
 * @returns Action factory compatible with Actions/PrettyGrid.
 */
export const useEditAction = <TRow extends BaseEntityDto>(
  props: UseSingleActionPropTypes<number>,
) => {
  const { t } = useTranslation();

  const {
    onClick,
    hidden = false,
    sticky = true,
    disabled = false,
    id = GlobalActions.Edit,
    icon = faPencil,
    tooltip = t("_pages:common.actions.edit.text"),
  } = props;

  const action = useCallback(
    (record: TRow): ActionType<TRow> => ({
      id,
      sticky,
      tooltip,
      onClick: () => onClick(record?.id),
      hidden: !!record.deletedAt || hidden,
      disabled: !!record.deletedAt || disabled,
      icon: <FontAwesomeIcon className="primary" icon={icon} />,
    }),
    [disabled, hidden, icon, id, onClick, sticky, tooltip],
  );

  return {
    action,
  };
};
