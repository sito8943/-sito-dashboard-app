import { useCallback } from "react";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faCloudArrowDown,
} from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseExportAction } from "hooks";

export const useExportAction = (props: UseExportAction) => {
  const { t } = useTranslation();

  const {
    onClick,
    hidden = false,
    disabled = false,
    isLoading = false,
  } = props;

  const action = useCallback(
    () => ({
      id: GlobalActions.Export,
      hidden: hidden,
      disabled: disabled,
      icon: (
        <FontAwesomeIcon
          className={`${isLoading ? "rotate" : ""}`}
          icon={isLoading ? faCircleNotch : faCloudArrowDown}
        />
      ),
      tooltip: t("_pages:common.actions.export.text"),
      onClick: onClick,
    }),
    [disabled, hidden, isLoading, onClick, t]
  );

  return {
    action,
  };
};
