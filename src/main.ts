// styles
import "./index.css";

// components
export * from "./components";

// providers
export * from "./providers";

// lib
export * from "./lib";

// hooks
export * from "./hooks";

// layouts
export * from "./layouts";

// views
export * from "./views";

// @sito/dashboard
export * from "@sito/dashboard";

// override: expose our IconButton (FontAwesome-based) instead of @sito/dashboard's
export { AppIconButton as IconButton } from "./components/ui/Buttons/IconButton";
export type { IconButtonPropsLocalType as IconButtonPropsType } from "./components/ui/Buttons/IconButton";
