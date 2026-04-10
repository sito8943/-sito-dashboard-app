import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

// types
import type { SupabaseManagerProviderPropTypes } from "./types";

import { SupabaseManagerContext } from "./SupabaseContext";
import { createQueryClient } from "../ManagerProvider";

const SupabaseManagerProvider = (props: SupabaseManagerProviderPropTypes) => {
  const { children, supabase, queryClient: providedQueryClient } = props;
  const [defaultQueryClient] = useState(createQueryClient);
  const client = providedQueryClient ?? defaultQueryClient;

  return (
    <SupabaseManagerContext.Provider value={{ client: supabase }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SupabaseManagerContext.Provider>
  );
};

export { SupabaseManagerProvider };
