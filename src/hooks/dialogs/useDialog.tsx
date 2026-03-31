import { useState } from "react";

/** Provides basic open/close state helpers for dialog components. */
export const useDialog = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = () => setOpen(true);

  return { open, setOpen, handleClose, handleOpen };
};
