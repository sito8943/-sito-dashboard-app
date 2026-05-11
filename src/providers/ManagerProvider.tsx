import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// manager
import { ManagerProviderPropTypes } from "./types";
import { ManagerContext } from "./ManagerContext";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
        retry: false,
        retryOnMount: true,
        refetchOnWindowFocus: false, // default: true
      },
    },
  });

// Deprecated export retained for backward compatibility.
const queryClient = createQueryClient();

/**
 * Manager Provider
 * @param props - provider props
 * @returns  React component
 */
const ManagerProvider = (props: ManagerProviderPropTypes) => {
  const { children, manager, queryClient: providedQueryClient } = props;
  const [defaultQueryClient] = useState(createQueryClient);
  const client = providedQueryClient ?? defaultQueryClient;

  return (
    <ManagerContext.Provider value={{ client: manager }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ManagerContext.Provider>
  );
};

export { createQueryClient, queryClient, ManagerProvider };
