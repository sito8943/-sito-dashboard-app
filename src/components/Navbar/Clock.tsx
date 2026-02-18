import { useEffect, useState } from "react";

// lib
import { getFormattedDateTime, getShortFormattedDateTime } from "lib";

export const Clock = () => {
  const [dateNow, setDateNow] = useState(getFormattedDateTime());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateTime = () => {
      setDateNow(
        !mediaQuery.matches
          ? getShortFormattedDateTime()
          : getFormattedDateTime()
      );
    };

    const interval = setInterval(updateTime, 1000);

    mediaQuery.addEventListener("change", updateTime);

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener("change", updateTime);
    };
  }, []);

  return <p className="capitalize max-xs:hidden">{dateNow}</p>;
};
