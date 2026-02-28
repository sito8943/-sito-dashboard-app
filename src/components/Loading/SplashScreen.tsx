import { Loading } from "@sito/dashboard";

// styles
import "./styles.css";

// types
import { LoadingPropsType } from "./types";

export function SplashScreen(props: LoadingPropsType) {
  const { className, ...rest } = props;
  return (
    <div className="splash-screen">
      <Loading className={`blur-appear${className ? ` ${className}` : ""}`} {...rest} />
    </div>
  );
}
