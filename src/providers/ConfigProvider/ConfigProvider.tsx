import { useEffect, useRef } from "react";

import { ConfigContext } from "../ConfigContext";
import type { ConfigProviderPropTypes } from "../types";
import {
  registerMotionPreference,
  unregisterMotionPreference,
  updateMotionPreference,
} from "./utils";

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
  const motionEntryIdRef = useRef<number | null>(null);

  useEffect(() => {
    const entryId =
      motionEntryIdRef.current ?? registerMotionPreference(motion);
    motionEntryIdRef.current = entryId;
    updateMotionPreference(entryId, motion);

    return () => {
      unregisterMotionPreference(entryId);
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
