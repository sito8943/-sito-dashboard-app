export const hasInputValue = (
  inputValue: string | number | readonly string[] | undefined | null,
) => {
  if (inputValue === undefined || inputValue === null) return false;
  if (Array.isArray(inputValue)) return inputValue.length > 0;
  return String(inputValue).length > 0;
};
