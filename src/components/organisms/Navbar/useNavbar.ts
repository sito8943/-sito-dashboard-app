import { useContext } from "react";

import { NavbarContext } from "./NavbarContext.js";

/**
 * useNavbar hook
 * @returns {NavbarContextType} Navbar context values.
 * @throws {Error} If used outside `NavbarProvider`.
 */
export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) throw new Error("useNavbar must be used within NavbarProvider");
  return context;
};
