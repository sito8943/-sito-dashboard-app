import { Dispatch, ReactNode, SetStateAction } from "react";

export const EMPTY_EXTRA = Object.freeze({}) as Record<string, never>;

export type ExtraFieldsContext<TExtra extends Record<string, unknown>> = {
  values: TExtra;
  setValue: <K extends keyof TExtra>(key: K, value: TExtra[K]) => void;
  setValues: (values: TExtra) => void;
};

export type RenderExtraFields<TExtra extends Record<string, unknown>> = (
  ctx: ExtraFieldsContext<TExtra>,
) => ReactNode;

/**
 * Returns the initial value used for the `extra` form state. Falls back to a
 * shared frozen empty object when the consumer does not provide defaults.
 */
export const resolveInitialExtra = <TExtra extends Record<string, unknown>>(
  defaultExtra: TExtra | undefined,
): TExtra => (defaultExtra ?? (EMPTY_EXTRA as unknown as TExtra)) as TExtra;

/**
 * Builds a stable setter that updates a single key in the `extra` form state.
 */
export const createExtraSetter =
  <TExtra extends Record<string, unknown>>(
    setExtra: Dispatch<SetStateAction<TExtra>>,
  ) =>
  <K extends keyof TExtra>(key: K, value: TExtra[K]) =>
    setExtra((prev) => ({ ...prev, [key]: value }));
