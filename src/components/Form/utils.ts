export const hasInputValue = (
  inputValue: string | number | readonly string[] | undefined | null,
) => {
  if (inputValue === undefined || inputValue === null) return false;
  return `${inputValue}`.length > 0;
};
