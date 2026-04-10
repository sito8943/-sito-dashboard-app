import { useContext, createContext } from "react";
import { SupabaseManagerProviderContextType } from "./types";

/** React context that stores the active Supabase manager client. */
export const SupabaseManagerContext = createContext<
  SupabaseManagerProviderContextType | undefined
>(undefined);

/**
 * Returns the Supabase client from context and enforces provider usage.
 * @returns Supabase manager client.
 * @throws {Error} If used outside `SupabaseManagerProvider`.
 */
export const useSupabase = () => {
  const context = useContext(SupabaseManagerContext);

  if (!context)
    throw new Error("useSupabase must be used within SupabaseManagerProvider");
  return context.client;
};
