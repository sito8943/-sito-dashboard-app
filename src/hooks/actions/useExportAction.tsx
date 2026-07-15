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

/**
 * Creates an export action descriptor with loading-state icon handling.
 * @param props - Export action options.
 * @returns Action factory for export triggers.
 */
export const useExportAction = (props: UseExportAction) => {
  const { t } = useTranslation();

  const {
    onClick,
    hidden = false,
    disabled = false,
    isLoading = false,
    id = GlobalActions.Export,
    icon = faCloudArrowDown,
    tooltip = t("_pages:common.actions.export.text"),
    className,
    iconClassName,
    labelClassName,
  } = props;

  const action = useCallback(
    () => ({
      id,
      hidden,
      disabled,
      className,
      iconClassName,
      labelClassName,
      icon: (
        <FontAwesomeIcon
          className={isLoading ? "rotate" : ""}
          icon={isLoading ? faCircleNotch : icon}
        />
      ),
      tooltip,
      onClick,
    }),
    [
      className,
      disabled,
      hidden,
      icon,
      iconClassName,
      id,
      isLoading,
      labelClassName,
      onClick,
      tooltip,
    ],
  );

  return {
    action,
  };
};
