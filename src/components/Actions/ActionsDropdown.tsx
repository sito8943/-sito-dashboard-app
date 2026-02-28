import { useState } from "react";
import { useTranslation, Dropdown } from "@sito/dashboard";

// icons
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

// lib
import { BaseEntityDto } from "lib";

// types
import { ActionsContainerPropsType } from "./types";

// components
import { Actions } from "./Actions";
import { AppIconButton } from "../Buttons";

export const ActionsDropdown = <TRow extends BaseEntityDto>(
  props: ActionsContainerPropsType<TRow>
) => {
  const { actions = [], className = "" } = props;

  const { t } = useTranslation();

  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <div className={`actions-dropdown ${className}`}>
      <AppIconButton
        icon={faEllipsisV}
        onClick={(e) => {
          setAnchorEl(e.currentTarget as HTMLElement);
          setOpenMenu((prev) => !prev);
        }}
        className="actions-dropdown-trigger"
        data-tooltip-id="tooltip"
        data-tooltip-content={t("_accessibility:buttons.openActions")}
      />
      <Dropdown open={openMenu} onClose={() => setOpenMenu(false)} anchorEl={anchorEl}>
        <Actions
          showActionTexts
          actions={actions}
          className="actions-dropdown-list"
          showTooltips={false}
        />
      </Dropdown>
    </div>
  );
};
