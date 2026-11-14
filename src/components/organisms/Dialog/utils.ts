import {
  DIALOG_HISTORY_STATE_KEY,
  DIALOG_MOBILE_MEDIA_QUERY,
} from "./constants";

let dialogHistoryEntrySequence = 0;

/** History entry ids of the open mobile dialogs, outermost first. */
const openDialogHistoryEntryIds: string[] = [];

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

export const registerDialogHistoryEntry = (dialogHistoryEntryId: string) => {
  openDialogHistoryEntryIds.push(dialogHistoryEntryId);
};

export const unregisterDialogHistoryEntry = (dialogHistoryEntryId: string) => {
  const index = openDialogHistoryEntryIds.indexOf(dialogHistoryEntryId);
  if (index >= 0) openDialogHistoryEntryIds.splice(index, 1);
};

/**
 * Whether the history moved to this dialog's own entry or to the entry of a
 * dialog opened on top of it (e.g. a nested dialog closing and going back to
 * its parent's entry). Only a move below this dialog's entry must close it.
 */
export const isDialogHistoryEntryAtOrAbove = (
  state: unknown,
  dialogHistoryEntryId: string,
) => {
  const stateEntryId = getDialogHistoryEntryId(state);
  if (stateEntryId === null) return false;
  if (stateEntryId === dialogHistoryEntryId) return true;

  const ownIndex = openDialogHistoryEntryIds.indexOf(dialogHistoryEntryId);
  const stateIndex = openDialogHistoryEntryIds.indexOf(stateEntryId);

  return ownIndex >= 0 && stateIndex > ownIndex;
};

export const isMobileDialogViewport = () => {
  if (typeof window === "undefined") return false;

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(DIALOG_MOBILE_MEDIA_QUERY).matches;
  }

  return window.innerWidth <= 640;
};
