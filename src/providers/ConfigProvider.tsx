import { createContext, useContext } from "react";

// config
import { ConfigProviderContextType, ConfigProviderPropTypes } from "./types";

const ConfigContext = createContext({} as ConfigProviderContextType);

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

/**
 * useConfig hook
 * @returns Provider
 */
const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined || Object.keys(context).length === 0)
    throw new Error(
      "Config provider has not been set. This step is required and cannot be skipped."
    );
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { ConfigProvider, useConfig };
