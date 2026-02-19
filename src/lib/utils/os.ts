export const isMac = () => {
  const nav = navigator as any;
  const platform = nav?.userAgentData?.platform || nav?.platform || "";
  return /Mac|iPhone|iPod|iPad/i.test(platform);
};
