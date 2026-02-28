// lib
import { BaseEntityDto } from "lib";

// components
import { Action } from "./Action";

// types
import { ActionsContainerPropsType } from "./types";

// styles
import "./styles.css";

export function Actions<TRow extends BaseEntityDto>(
  props: ActionsContainerPropsType<TRow>
) {
  const {
    actions = [],
    className = "",
    itemClassName = "",
    actionClassName = "",
    showTooltips = true,
    showActionTexts = false,
  } = props;
  return (
    <ul className={`actions-container ${className}`}>
      {actions?.map((action) => (
        <li
          key={action.id}
          className={`actions-container-item ${itemClassName}`}
        >
          <Action
            showTooltips={showTooltips}
            showText={showActionTexts}
            className={actionClassName}
            {...action}
          />
        </li>
      ))}
    </ul>
  );
}
