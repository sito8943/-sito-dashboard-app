import { ButtonPropsType } from "./types";

// styles
import "./styles.css";

export const Button = (props: ButtonPropsType) => {
  const {
    children,
    type = "button",
    variant = "text",
    color = "default",
    className = "",
    ...rest
  } = props;

  return (
    <button type={type} className={`button ${variant} ${color} ${className}`} {...rest}>
      {children}
    </button>
  );
};
