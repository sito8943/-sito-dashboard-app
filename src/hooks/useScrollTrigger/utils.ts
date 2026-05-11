import { INITIAL_SCROLL_Y } from "./constants";

export const getWindowScrollY = () =>
  typeof window !== "undefined" ? window.scrollY : INITIAL_SCROLL_Y;
