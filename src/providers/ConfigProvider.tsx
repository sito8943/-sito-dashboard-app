import type { ConfigProviderPropTypes } from "./types";

import { ConfigContext } from "./ConfigContext";

/**
 * Config Provider
 * @param props - provider props
 * @returns  React component
 */
const ConfigProvider = (props: ConfigProviderPropTypes) => {
  const { children, location, navigate, linkComponent, searchComponent } =
    props;

  return (
    <ConfigContext.Provider
      value={{ location, navigate, linkComponent, searchComponent }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigProvider };
