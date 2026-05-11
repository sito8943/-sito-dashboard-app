import { useOptionalBottomNavAction } from "./useOptionalBottomNavAction";

/**
 * Returns the current bottom nav action context.
 */
export const useBottomNavAction = () => {
  const ctx = useOptionalBottomNavAction();

  if (!ctx)
    throw new Error(
      "useBottomNavAction must be used within BottomNavActionProvider",
    );

  return ctx;
};
