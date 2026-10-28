// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// types
import { StepButtonContentPropsType } from "./types";

// styles
import "./styles.css";

/**
 * Renders the icon + label pair used inside each onboarding step action
 * button. CSS controls per-breakpoint visibility via `.step-button-icon` and
 * `.step-button-label`.
 * @param props - Step button content props.
 * @returns Step button content element.
 */
export const StepButtonContent = (props: StepButtonContentPropsType) => {
  const { icon, label } = props;
  return (
    <>
      <FontAwesomeIcon className="step-button-icon" icon={icon} />
      <span className="step-button-label">{label}</span>
    </>
  );
};
