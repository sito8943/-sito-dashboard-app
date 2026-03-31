/* eslint-disable react-refresh/only-export-components */
import {
  useContext,
  createContext,
  useReducer,
  useRef,
  useMemo,
  useCallback,
} from "react";

// lib
import { NotificationEnumType, NotificationType } from "lib";

// types
import { BasicProviderPropTypes, NotificationContextType } from "./types";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/** Provides notification state and helper actions to descendant components. */
export function NotificationProvider(props: BasicProviderPropTypes) {
  const { children } = props;

  // Instance-scoped counter — avoids the module-level side effect while still
  // guaranteeing unique IDs across all notifications shown in this session.
  const nextIdRef = useRef(0);

  const [notification, dispatch] = useReducer(
    (
      state: NotificationType[],
      action: { type: string; items?: NotificationType[]; id?: number },
    ) => {
      const { type, items, id } = action;

      switch (type) {
        case "set":
          // IDs are stamped by the action creators below; reducer stays pure.
          return items ?? [];
        case "remove":
          if (id !== undefined) return state.filter((n) => n.id !== id);
          return [];
      }
      return state;
    },
    [] as NotificationType[],
    () => [] as NotificationType[],
  );

  const withId = (items: NotificationType[]) =>
    items.map((item) => ({ ...item, id: nextIdRef.current++ }));

  const showErrorNotification = useCallback(
    (options: Partial<NotificationType>) =>
      dispatch({
        type: "set",
        items: withId([{ ...options, type: NotificationEnumType.error }]),
      }),
    [],
  );

  const showNotification = useCallback(
    (options: NotificationType) =>
      dispatch({ type: "set", items: withId([{ ...options }]) }),
    [],
  );

  const showStackNotifications = useCallback(
    (notifications: NotificationType[]) =>
      dispatch({ type: "set", items: withId(notifications) }),
    [],
  );

  const showSuccessNotification = useCallback(
    (options: Partial<NotificationType>) =>
      dispatch({
        type: "set",
        items: withId([{ ...options, type: NotificationEnumType.success }]),
      }),
    [],
  );

  const removeNotification = (id?: number) => dispatch({ type: "remove", id });

  const value = useMemo(() => {
    return {
      notification,
      removeNotification,
      showErrorNotification,
      showNotification,
      showSuccessNotification,
      showStackNotifications,
    };
  }, [
    notification,
    showErrorNotification,
    showNotification,
    showStackNotifications,
    showSuccessNotification,
  ]);

  return (
    <NotificationContext.Provider value={value}>
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

  if (!context)
    throw new Error("NotificationContext must be used within a Provider");
  return context;
};
