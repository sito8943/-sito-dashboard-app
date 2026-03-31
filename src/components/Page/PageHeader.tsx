import { useTranslation } from "@sito/dashboard";

// icons
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// types
import { PageHeaderPropsType } from "./types";

// lib
import { BaseEntityDto } from "lib";

// components
import { Actions, ActionsDropdown, AppIconButton } from "components";

// providers
import { useConfig } from "providers";

// styles
import "./styles.css";

/**
 * Renders page title plus desktop/mobile action controls and back button.
 * @param props - Page header props.
 * @returns Page header element.
 */
export const PageHeader = <TEntity extends BaseEntityDto>(
  props: PageHeaderPropsType<TEntity>,
) => {
  const { showBackButton, title, actions } = props;

  const { t } = useTranslation();

  const { navigate } = useConfig();

  return (
    <div className="page-header">
      <div className="page-header-left">
        {showBackButton && (
          <AppIconButton
            icon={faArrowLeft}
            onClick={() => navigate(-1)}
            className="page-header-back"
            name={t("_accessibility:buttons.back")}
            data-tooltip-id="tooltip"
            data-tooltip-content={t("_accessibility:buttons.back")}
          />
        )}
        <h2 className="page-header-title">{title}</h2>
      </div>
      <div>
        <Actions
          className="page-header-actions-desktop"
          actions={actions ?? []}
        />
        <ActionsDropdown
          className="page-header-actions-mobile"
          actions={actions ?? []}
        />
      </div>
    </div>
  );
};
