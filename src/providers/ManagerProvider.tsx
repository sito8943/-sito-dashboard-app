import { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// manager
import { ManagerProviderContextType, ManagerProviderPropTypes } from "./types";

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

const ManagerContext = createContext<ManagerProviderContextType | undefined>(
  undefined,
);

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

/**
 * useManager hook
 * @returns Provider
 */
const useManager = () => {
  const context = useContext(ManagerContext);

  if (!context)
    throw new Error("managerContext must be used within a Provider");
  return context.client;
};

// eslint-disable-next-line react-refresh/only-export-components
export { createQueryClient, queryClient, ManagerProvider, useManager };
