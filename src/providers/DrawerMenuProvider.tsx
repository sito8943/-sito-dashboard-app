import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// type
import { DrawerMenuContextType, DrawerMenuProviderPropTypes } from "./types";

// lib
import { SubMenuItemType } from "lib";

const DrawerMenuContext = createContext<DrawerMenuContextType<string> | undefined>(
  undefined
);

/**
 * Drawer Menu Provider
 * @param props - provider props
 * @returns  React component
 */
const DrawerMenuProvider = <MenuKeys extends string>(
  props: DrawerMenuProviderPropTypes
) => {
  const { children } = props;

  const [dynamicItems, setDynamicItems] = useState<
    Record<MenuKeys, SubMenuItemType[]>
  >({} as Record<MenuKeys, SubMenuItemType[]>);

  const addChildItem = useCallback(
    (parentId: MenuKeys, item: SubMenuItemType) =>
      setDynamicItems((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] ?? []), item],
      })),
    []
  );

  const removeChildItem = useCallback(
    (parentId: MenuKeys, index: number) =>
      setDynamicItems((prev) => ({
        ...prev,
        [parentId]: (prev[parentId] ?? []).filter((_, i) => i !== index),
      })),
    []
  );

  const clearDynamicItems = useCallback((parentId?: string) => {
    if (parentId)
      setDynamicItems((prev) => ({
        ...prev,
        [parentId]: [],
      }));
    else setDynamicItems({} as Record<MenuKeys, SubMenuItemType[]>);
  }, []);

  const value = useMemo<DrawerMenuContextType<MenuKeys>>(
    () => ({
      dynamicItems,
      addChildItem,
      removeChildItem,
      clearDynamicItems,
    }),
    [dynamicItems, clearDynamicItems, removeChildItem, addChildItem]
  );

  return (
    <DrawerMenuContext.Provider
      value={value as unknown as DrawerMenuContextType<string>}
    >
      {children}
    </DrawerMenuContext.Provider>
  );
};

/**
 * useDrawerMenu hook
 * @returns Provider
 */
const useDrawerMenu = <MenuKeys extends string>() => {
  const context = useContext(DrawerMenuContext);
  if (!context)
    throw new Error("DrawerMenuContext must be used within a Provider");
  return context as DrawerMenuContextType<MenuKeys>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { DrawerMenuContext, DrawerMenuProvider, useDrawerMenu };
