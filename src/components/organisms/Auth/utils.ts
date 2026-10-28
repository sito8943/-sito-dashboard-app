import type { FieldValues } from "react-hook-form";
import type { TextInputPropsType } from "@sito/dashboard";

import type { AuthFormFieldDefinitionType } from "./types";

export const getAuthInputValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

export const getAuthInputType = <TFormType extends FieldValues>(
  field: AuthFormFieldDefinitionType<TFormType>,
): TextInputPropsType["type"] => {
  if (field.kind !== "text") return undefined;
  return field.type ?? "text";
};
