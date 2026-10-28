import { IconButton as IconButtonBase } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// types
import type { IconButtonPropsLocalType } from "./types";
export type { IconButtonPropsLocalType } from "./types";

/**
 * Wraps dashboard IconButton to accept a FontAwesome IconDefinition.
 * @param props - Icon button props with a FontAwesome icon.
 * @returns Wrapped dashboard IconButton element.
 */
export const AppIconButton = ({
  icon,
  iconSize = "sm",
  ...rest
}: IconButtonPropsLocalType) => {
  return (
    <IconButtonBase
      icon={<FontAwesomeIcon icon={icon} size={iconSize} />}
      {...rest}
    />
  );
};
