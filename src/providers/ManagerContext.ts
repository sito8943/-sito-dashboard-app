import { createContext } from "react";

import type { ManagerProviderContextType } from "./types";

export const ManagerContext = createContext<
  ManagerProviderContextType | undefined
>(undefined);
