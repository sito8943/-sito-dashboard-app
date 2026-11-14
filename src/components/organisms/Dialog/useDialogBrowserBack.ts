import { useEffect, useRef } from "react";

import {
  createDialogHistoryEntryId,
  createDialogHistoryState,
  getDialogHistoryEntryId,
  isDialogHistoryEntryAtOrAbove,
  isMobileDialogViewport,
  registerDialogHistoryEntry,
  unregisterDialogHistoryEntry,
} from "./utils";

export const useDialogBrowserBack = (
  open: boolean,
  handleClose: () => void,
) => {
  const handleCloseRef = useRef(handleClose);

  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  useEffect(() => {
    if (!open || !isMobileDialogViewport()) return;

    const dialogHistoryEntryId = createDialogHistoryEntryId();

    window.history.pushState(
      createDialogHistoryState(window.history.state, dialogHistoryEntryId),
      "",
      window.location.href,
    );
    registerDialogHistoryEntry(dialogHistoryEntryId);

    const handlePopState = (event: PopStateEvent) => {
      if (isDialogHistoryEntryAtOrAbove(event.state, dialogHistoryEntryId))
        return;

      handleCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      unregisterDialogHistoryEntry(dialogHistoryEntryId);

      if (
        getDialogHistoryEntryId(window.history.state) === dialogHistoryEntryId
      ) {
        window.history.back();
      }
    };
  }, [open]);
};
