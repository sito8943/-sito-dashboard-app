import { createContext, useContext } from "react";

// config
import { ConfigProviderContextType, ConfigProviderPropTypes } from "./types";

const ConfigContext = createContext<ConfigProviderContextType | undefined>(
  undefined,
);

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
 * @returns {ConfigProviderContextType} Config context values.
 * @throws {Error} If used outside `ConfigProvider`.
 */
const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used within ConfigProvider");
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { ConfigProvider, useConfig };
