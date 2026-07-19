import {
  DIALOG_HISTORY_STATE_KEY,
  DIALOG_MOBILE_MEDIA_QUERY,
} from "./constants";

let dialogHistoryEntrySequence = 0;

const toHistoryStateRecord = (state: unknown): Record<string, unknown> => {
  if (!state || typeof state !== "object" || Array.isArray(state)) return {};

  return state as Record<string, unknown>;
};

export const createDialogHistoryEntryId = () => {
  dialogHistoryEntrySequence += 1;

  return `sito-dashboard-dialog-${dialogHistoryEntrySequence}`;
};

export const createDialogHistoryState = (
  state: unknown,
  dialogHistoryEntryId: string,
) => ({
  ...toHistoryStateRecord(state),
  [DIALOG_HISTORY_STATE_KEY]: dialogHistoryEntryId,
});

export const getDialogHistoryEntryId = (state: unknown) => {
  const value = toHistoryStateRecord(state)[DIALOG_HISTORY_STATE_KEY];

  return typeof value === "string" ? value : null;
};

export const isMobileDialogViewport = () => {
  if (typeof window === "undefined") return false;

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(DIALOG_MOBILE_MEDIA_QUERY).matches;
  }

  return window.innerWidth <= 640;
};
