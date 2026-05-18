import { useEffect } from "react";
import type { ConfigProviderPropTypes } from "./types";

import { ConfigContext } from "./ConfigContext";

const MOTION_ATTRIBUTE = "data-sito-motion";

/**
 * Config Provider
 * @param props - provider props
 * @returns  React component
 */
const ConfigProvider = (props: ConfigProviderPropTypes) => {
  const {
    children,
    location,
    navigate,
    linkComponent,
    searchComponent,
    motion = "auto",
  } = props;

  useEffect(() => {
    const root = document.documentElement;
    const previousValue = root.getAttribute(MOTION_ATTRIBUTE);

    if (motion === "auto") root.removeAttribute(MOTION_ATTRIBUTE);
    else root.setAttribute(MOTION_ATTRIBUTE, motion);

    return () => {
      if (previousValue === null) root.removeAttribute(MOTION_ATTRIBUTE);
      else root.setAttribute(MOTION_ATTRIBUTE, previousValue);
    };
  }, [motion]);

  return (
    <ConfigContext.Provider
      value={{ location, navigate, linkComponent, searchComponent, motion }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigProvider };
