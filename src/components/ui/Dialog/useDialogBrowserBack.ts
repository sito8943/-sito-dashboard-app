import { useEffect, useRef } from "react";

import {
  createDialogHistoryEntryId,
  createDialogHistoryState,
  getDialogHistoryEntryId,
  isMobileDialogViewport,
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
      createDialogHistoryState(
        window.history.state,
        dialogHistoryEntryId,
      ),
      "",
      window.location.href,
    );

    const handlePopState = (event: PopStateEvent) => {
      if (getDialogHistoryEntryId(event.state) === dialogHistoryEntryId) return;

      handleCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      if (
        getDialogHistoryEntryId(window.history.state) === dialogHistoryEntryId
      ) {
        window.history.back();
      }
    };
  }, [open]);
};
