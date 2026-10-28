import { BaseSyntheticEvent } from "react";
import {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";

export const hasInputValue = (
  inputValue: string | number | readonly string[] | undefined | null,
) => {
  if (inputValue === undefined || inputValue === null) return false;
  if (Array.isArray(inputValue)) return inputValue.length > 0;
  return String(inputValue).length > 0;
};

/**
 * Builds a submit handler that defers `handleSubmit(onSubmit)` until the form
 * is actually submitted. Calling it during render would turn an already
 * invoked handler (`form.handleSubmit(cb)`) into a submit on every render.
 * @param handleSubmit - Uninvoked React Hook Form `handleSubmit`.
 * @param onSubmit - Callback receiving the validated values.
 * @param componentName - Component name used in the development warning.
 * @returns Submit event handler.
 */
export const createFormSubmitHandler =
  <TFormType extends FieldValues>(
    handleSubmit: UseFormHandleSubmit<TFormType>,
    onSubmit: SubmitHandler<TFormType>,
    componentName: string,
  ) =>
  (event?: BaseSyntheticEvent) => {
    // Misuse may skip React Hook Form's own preventDefault; avoid a page reload.
    event?.preventDefault?.();
    const submit: unknown = handleSubmit(onSubmit);
    if (typeof submit === "function") return submit(event);

    // `handleSubmit` was already invoked (`form.handleSubmit(cb)`), so the
    // call above ran that handler once. Warn instead of failing silently.
    if (import.meta.env.DEV) {
      console.warn(
        `[${componentName}] \`handleSubmit\` must be the uninvoked \`form.handleSubmit\`; pass the callback through \`onSubmit\`.`,
      );
    }
    return submit;
  };
