import { Loading } from "@sito/dashboard";

// styles
import "./styles.css";

export function SplashScreen() {
  return (
    <div className="splash-screen">
      <Loading className="blur-appear" />
    </div>
  );
}
