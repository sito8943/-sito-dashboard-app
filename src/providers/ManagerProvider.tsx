import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

// manager
import { ManagerProviderPropTypes } from "./types";
import { ManagerContext } from "./ManagerContext";
import { createQueryClient } from "./queryClient";

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

// eslint-disable-next-line react-refresh/only-export-components
export { createQueryClient, queryClient } from "./queryClient";
export { ManagerProvider };
