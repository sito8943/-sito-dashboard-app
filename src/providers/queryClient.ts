import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
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
export const queryClient = createQueryClient();
