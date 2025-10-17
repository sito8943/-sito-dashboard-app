import { useTranslation } from "@sito/dashboard";

// icons
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// types
import { PageHeaderPropsType } from "./types";

// lib
import { BaseEntityDto } from "lib";

// components
import { Actions, ActionsDropdown, IconButton } from "components";

// hooks
import { useScrollTrigger } from "hooks";

// providers
import { useConfig } from "providers";

// styles
import "./styles.css";

export const PageHeader = <TEntity extends BaseEntityDto>(
  props: PageHeaderPropsType<TEntity>
) => {
  const { showBackButton, title, actions } = props;

  const { t } = useTranslation();

  const { navigate } = useConfig();

  return (
    <div className="page-header">
      <div className="flex gap-2 items-center justify-start">
        {showBackButton && (
          <IconButton
            icon={faArrowLeft}
            onClick={() => navigate(-1)}
            name={t("_accessibility:buttons.back")}
            data-tooltip-id="tooltip"
            data-tooltip-content={t("_accessibility:buttons.back")}
          />
        )}
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>
      <div>
        <Actions className="max-xs:!hidden" actions={actions ?? []} />
        <ActionsDropdown className="min-xs:hidden" actions={actions ?? []} />
      </div>
    </div>
  );
};
