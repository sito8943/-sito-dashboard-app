// types
import { BottomNavigationCenterActionType } from "../../components";
import type { BottomNavActionRegistrationType } from "./types";

const toComparableString = (value: unknown): string => {
  if (typeof value === "function") return "__function__";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const normalizeBottomNavAction = (
  action: BottomNavActionRegistrationType,
): BottomNavigationCenterActionType | null => {
  if (!action) return null;
  if (typeof action === "function") return { onClick: () => action() };
  return action;
};

export const toActionRegistrationKey = (
  action: BottomNavActionRegistrationType,
): string => {
  if (!action) return "null";
  if (typeof action === "function") return "function";

  const { onClick, icon, ...rest } = action;

  const stableRest = Object.entries(rest)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${toComparableString(value)}`)
    .join("|");

  return [
    `rest=${stableRest}`,
    `hasOnClick=${typeof onClick === "function"}`,
    `icon=${icon ? `${icon.prefix}:${icon.iconName}` : "null"}`,
  ].join(";");
};
