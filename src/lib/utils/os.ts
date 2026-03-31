/**
 * Returns true when the current platform should be treated as macOS/iOS.
 * @returns Whether the running platform is Apple-based.
 */
export const isMac = () => {
  const nav = navigator as any;
  const platform = nav?.userAgentData?.platform || nav?.platform || "";
  return /Mac|iPhone|iPod|iPad/i.test(platform);
};
