import { useCallback } from "react";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faCloudUpload,
} from "@fortawesome/free-solid-svg-icons";

// types
import { GlobalActions, UseImportAction } from "hooks";

/**
 * Creates an import action descriptor with loading-state icon handling.
 * @param props - Import action options.
 * @returns Action factory for import triggers.
 */
export const useImportAction = (props: UseImportAction) => {
  const { t } = useTranslation();

  const {
    onClick,
    hidden = false,
    disabled = false,
    isLoading = false,
    id = GlobalActions.Import,
    icon = faCloudUpload,
    tooltip = t("_pages:common.actions.import.text"),
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
          className={`${isLoading ? "rotate" : ""}`}
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
