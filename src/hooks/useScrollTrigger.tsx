import { useCallback, useEffect, useState } from "react";

const getWindowScrollY = () =>
  typeof window !== "undefined" ? window.scrollY : 0;

export function useScrollTrigger(offset: number) {
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
