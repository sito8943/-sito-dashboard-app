import { useContext } from "react";

import { ManagerContext } from "./ManagerContext";

/**
 * useManager hook
 * @returns Manager client from context.
 * @throws {Error} If used outside `ManagerProvider`.
 */
export const useManager = () => {
  const context = useContext(ManagerContext);

  if (!context)
    throw new Error("useManager must be used within ManagerProvider");
  return context.client;
};
