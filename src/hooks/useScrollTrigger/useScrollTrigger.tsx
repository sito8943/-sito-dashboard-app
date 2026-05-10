import { useCallback, useEffect, useState } from "react";

// types
import type { ScrollOffset } from "./types";

// utils
import { getWindowScrollY } from "./utils";

/**
 * Returns true when page scroll exceeds the provided offset.
 * @param offset - Scroll threshold in pixels.
 * @returns Whether current vertical scroll is above offset.
 */
export function useScrollTrigger(offset: ScrollOffset) {
  const [scrollY, setScrollY] = useState(getWindowScrollY);

  const onScroll = useCallback(() => {
    setScrollY(getWindowScrollY());
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  return scrollY > offset;
}
