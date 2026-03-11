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

// @sito/dashboard
export * from "@sito/dashboard";

// override: expose our IconButton (FontAwesome-based) instead of @sito/dashboard's
export { AppIconButton as IconButton } from "./components/Buttons/IconButton";
export type { IconButtonPropsLocalType as IconButtonPropsType } from "./components/Buttons/IconButton";
