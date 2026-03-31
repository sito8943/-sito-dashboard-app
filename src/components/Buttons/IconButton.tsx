import {
  IconButton as IconButtonBase,
  IconButtonPropsType,
} from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type IconButtonPropsLocalType = Omit<IconButtonPropsType, "icon"> & {
  icon: IconDefinition;
};

/**
 * Wraps dashboard IconButton to accept a FontAwesome IconDefinition.
 * @param props - Icon button props with a FontAwesome icon.
 * @returns Wrapped dashboard IconButton element.
 */
export const AppIconButton = ({ icon, ...rest }: IconButtonPropsLocalType) => {
  return <IconButtonBase icon={<FontAwesomeIcon icon={icon} />} {...rest} />;
};
