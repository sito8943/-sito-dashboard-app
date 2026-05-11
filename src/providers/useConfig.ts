import { useContext } from "react";

import type { ConfigProviderContextType } from "./types";
import { ConfigContext } from "./ConfigContext";

/**
 * useConfig hook
 * @returns {ConfigProviderContextType} Config context values.
 * @throws {Error} If used outside `ConfigProvider`.
 */
export const useConfig = (): ConfigProviderContextType => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used within ConfigProvider");
  return context;
};
