import { useContext, createContext } from "react";
import { SupabaseManagerProviderContextType } from "./types";

export const SupabaseManagerContext = createContext<
  SupabaseManagerProviderContextType | undefined
>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseManagerContext);

  if (!context)
    throw new Error("supabaseManagerContext must be used within a Provider");
  return context.client;
};
