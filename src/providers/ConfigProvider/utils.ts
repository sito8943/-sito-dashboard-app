import type { MotionPreference } from "../types";
import { MOTION_ATTRIBUTE } from "./constants";

type MotionEntry = {
  id: number;
  motion: MotionPreference;
};

const motionEntries: MotionEntry[] = [];
let nextMotionEntryId = 0;

const syncMotionAttribute = () => {
  const root = document.documentElement;
  const activeEntry = [...motionEntries]
    .reverse()
    .find((entry) => entry.motion !== "auto");

  if (!activeEntry) {
    root.removeAttribute(MOTION_ATTRIBUTE);
    return;
  }

  root.setAttribute(MOTION_ATTRIBUTE, activeEntry.motion);
};

export const registerMotionPreference = (motion: MotionPreference) => {
  const id = ++nextMotionEntryId;
  motionEntries.push({ id, motion });
  syncMotionAttribute();
  return id;
};

export const updateMotionPreference = (
  id: number,
  motion: MotionPreference,
) => {
  const entry = motionEntries.find((item) => item.id === id);
  if (!entry) return;
  entry.motion = motion;
  syncMotionAttribute();
};

export const unregisterMotionPreference = (id: number) => {
  const entryIndex = motionEntries.findIndex((entry) => entry.id === id);
  if (entryIndex !== -1) motionEntries.splice(entryIndex, 1);
  syncMotionAttribute();
};
