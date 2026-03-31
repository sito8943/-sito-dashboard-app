import { Loading } from "@sito/dashboard";

// styles
import "./styles.css";

// types
import { LoadingPropsType } from "./types";

/** Renders a full-screen loading overlay for app bootstrapping states. */
export function SplashScreen(props: LoadingPropsType) {
  const { className, ...rest } = props;
  return (
    <div className="splash-screen">
      <Loading
        className={`blur-appear ${className ? ` ${className}` : ""}`}
        {...rest}
      />
    </div>
  );
}
