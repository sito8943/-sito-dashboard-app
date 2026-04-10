import { SupabaseClient } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";

// lib
import { SupabaseSessionMapper } from "lib";

// providers
import { BasicProviderPropTypes } from "providers";
import { AuthProviderPropTypes } from "providers/Auth";

export interface SupabaseManagerProviderPropTypes
  extends BasicProviderPropTypes {
  supabase: SupabaseClient;
  queryClient?: QueryClient;
}

export type SupabaseManagerProviderContextType = {
  client: SupabaseClient;
};

export interface SupabaseAuthProviderPropTypes extends AuthProviderPropTypes {
  sessionMapper?: SupabaseSessionMapper;
}
