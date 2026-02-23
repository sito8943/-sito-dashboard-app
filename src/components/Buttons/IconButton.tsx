import { IconButton as IconButtonBase, IconButtonPropsType } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type IconButtonPropsLocalType = Omit<IconButtonPropsType, "icon"> & {
  icon: IconDefinition;
};

export const IconButton = ({ icon, ...rest }: IconButtonPropsLocalType) => {
  return <IconButtonBase icon={<FontAwesomeIcon icon={icon} />} {...rest} />;
};
