import { createContext } from "react";

import type { ConfigProviderContextType } from "./types";

export const ConfigContext = createContext<
  ConfigProviderContextType | undefined
>(undefined);
