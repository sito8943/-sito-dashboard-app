export const readNavigatorOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;
