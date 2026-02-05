import { useCallback } from "react";
import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseMultipleActionPropTypes } from "hooks";

// lib
import { BaseEntityDto } from "lib";

export const useRestoreAction = (props: UseMultipleActionPropTypes<number>) => {
  const { t } = useTranslation();

  const { onClick, hidden = false } = props;

  const action = useCallback(
    (record: BaseEntityDto) => ({
      id: GlobalActions.Restore,
      hidden: !record.deletedAt || hidden,
      disabled: !record.deletedAt,
      icon: <FontAwesomeIcon className="text-red-500" icon={faRotateLeft} />,
      tooltip: t("_pages:common.actions.restore.text"),
      onClick: () => onClick([record?.id]),
    }),
    [hidden, onClick, t]
  );

  return {
    action,
  };
};
