import type { ReactNode } from "react";

import type { AnyAppProviderSlot } from "./types";

export const applyOptionalProvider = (
  children: ReactNode,
  slot?: AnyAppProviderSlot,
): ReactNode => {
  if (!slot || slot.enabled === false) return children;

  const { provider: Provider, props } = slot;

  return <Provider {...(props ?? {})}>{children}</Provider>;
};
