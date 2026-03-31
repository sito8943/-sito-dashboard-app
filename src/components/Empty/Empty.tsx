import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// types
import { EmptyPropsType } from "./types";

// lib
import { BaseEntityDto } from "lib";

// components
import { Action } from "components";

// styles
import "./styles.css";

/**
 * Displays an empty-state message with optional icon and action.
 * @param props - Empty-state props.
 * @returns Empty-state element.
 */
export const Empty = <TRow extends BaseEntityDto>(
  props: EmptyPropsType<TRow>,
) => {
  const {
    message,
    messageProps = { className: "empty-message" },
    action,
    iconProps,
  } = props;
  return (
    <div className="empty-container">
      {iconProps && <FontAwesomeIcon {...iconProps} />}
      <p {...messageProps}>{message}</p>
      {action && <Action showTooltips={false} showText {...action} />}
    </div>
  );
};
