import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

// types
import { NavbarContextType, NavbarProviderPropTypes } from "./types.js";

const NavbarContext = createContext<NavbarContextType>({
  title: "",
  setTitle: () => {},
  rightContent: null,
  setRightContent: () => {},
});

/**
 * Navbar Provider
 * @param props - provider props
 * @returns React component
 */
const NavbarProvider = (props: NavbarProviderPropTypes) => {
  const { children } = props;

  const [title, setTitleState] = useState<string>("");
  const [rightContent, setRightContentState] = useState<ReactNode>(null);

  const setTitle = useCallback((value: string) => {
    setTitleState(value);
  }, []);

  const setRightContent = useCallback((value: ReactNode) => {
    setRightContentState(value);
  }, []);

  const value = useMemo<NavbarContextType>(
    () => ({
      title,
      setTitle,
      rightContent,
      setRightContent,
    }),
    [title, setTitle, rightContent, setRightContent],
  );

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
};

/**
 * useNavbar hook
 * @returns Navbar context
 */
const useNavbar = () => useContext(NavbarContext);

// eslint-disable-next-line react-refresh/only-export-components
export { NavbarContext, NavbarProvider, useNavbar };
