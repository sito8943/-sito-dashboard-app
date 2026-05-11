import type { ComponentType } from "react";

import { AppProviders } from "./AppProviders";
import type { AppProvidersProps, BasicProviderPropTypes } from "./types";

/**
 * Returns a configured provider component so apps can avoid repeating the tree.
 */
export const createAppProviders = (
  config: Omit<AppProvidersProps, "children">,
): ComponentType<BasicProviderPropTypes> => {
  const CreatedAppProviders = ({ children }: BasicProviderPropTypes) => (
    <AppProviders {...config}>{children}</AppProviders>
  );

  return CreatedAppProviders;
};
