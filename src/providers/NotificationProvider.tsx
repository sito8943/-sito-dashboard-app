/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useReducer } from "react";

// lib
import { NotificationEnumType, NotificationType } from "lib";

// types
import { BasicProviderPropTypes, NotificationContextType } from "./types";

const NotificationContext = createContext({} as NotificationContextType);

// Module-level counter so IDs are unique across the lifetime of the app,
// preventing stale closing-set collisions when notifications are replaced.
let _nextId = 0;

export function NotificationProvider(props: BasicProviderPropTypes) {
  const { children } = props;

  const [notification, dispatch] = useReducer(
    (
      state: NotificationType[],
      action: { type: string; items?: NotificationType[]; id?: number }
    ) => {
      const { type, items, id } = action;

      switch (type) {
        case "set":
          return items?.map((item: NotificationType) => ({
            ...item,
            id: _nextId++,
          })) ?? [];
        case "remove":
          if (id !== undefined) return state.filter((n) => n.id !== id);
          return [];
      }
      return state;
    },
    [] as NotificationType[],
    () => [] as NotificationType[]
  );

  const showErrorNotification = (options: Partial<NotificationType>) =>
    dispatch({
      type: "set",
      items: [{ ...options, type: NotificationEnumType.error }],
    });

  const showNotification = (options: NotificationType) =>
    dispatch({
      type: "set",
      items: [{ ...options }],
    });

  const showStackNotifications = (notifications: NotificationType[]) =>
    dispatch({ type: "set", items: notifications });

  const showSuccessNotification = (options: Partial<NotificationType>) =>
    dispatch({
      type: "set",
      items: [{ ...options, type: NotificationEnumType.success }],
    });

  const removeNotification = (id?: number) =>
    dispatch({ type: "remove", id });

  return (
    <NotificationContext.Provider
      value={{
        notification,
        removeNotification,
        showErrorNotification,
        showNotification,
        showSuccessNotification,
        showStackNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 *
 * @returns notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined)
    throw new Error("NotificationContext must be used within a Provider");
  return context;
};
