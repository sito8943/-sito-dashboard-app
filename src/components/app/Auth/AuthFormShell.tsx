import { Controller, type FieldValues } from "react-hook-form";
import { CheckInput, classNames, State, TextInput } from "@sito/dashboard";

import { PasswordInput } from "../../ui/Form";
import { AuthScreenShell } from "./AuthScreenShell";
import { getAuthInputType, getAuthInputValue } from "./utils";

import type { AuthFormShellPropsType } from "./types";

export const AuthFormShell = <TFormType extends FieldValues>(
  props: AuthFormShellPropsType<TFormType>,
) => {
  const {
    control,
    fields,
    onSubmit,
    disabled = false,
    noValidate,
    formClassName,
    helperLinks,
    actions,
    ...screenProps
  } = props;

  return (
    <AuthScreenShell
      {...screenProps}
      formProps={{
        onSubmit,
        noValidate,
        className: formClassName,
      }}
      actions={actions}
    >
      <div className="auth-form-fields">
        {fields.map((fieldDefinition) => (
          <Controller
            key={fieldDefinition.name}
            control={control}
            name={fieldDefinition.name}
            rules={fieldDefinition.rules}
            disabled={disabled || fieldDefinition.disabled}
            render={({ field, fieldState }) => {
              const fieldDisabled = Boolean(
                disabled || fieldDefinition.disabled,
              );

              if (fieldDefinition.render) {
                return fieldDefinition.render({
                  field,
                  fieldState,
                  disabled: fieldDisabled,
                });
              }

              if (fieldDefinition.kind === "checkbox") {
                return (
                  <CheckInput
                    id={fieldDefinition.id ?? fieldDefinition.name}
                    name={field.name}
                    label={fieldDefinition.label}
                    checked={Boolean(field.value)}
                    disabled={fieldDisabled}
                    containerClassName={fieldDefinition.containerClassName}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.currentTarget.checked)
                    }
                  />
                );
              }

              const Input =
                fieldDefinition.kind === "password" ? PasswordInput : TextInput;

              return (
                <Input
                  {...field}
                  type={getAuthInputType(fieldDefinition)}
                  id={fieldDefinition.id ?? fieldDefinition.name}
                  value={getAuthInputValue(field.value)}
                  inputClassName={classNames(
                    "auth-form-input peer",
                    fieldDefinition.inputClassName,
                  )}
                  containerClassName={fieldDefinition.containerClassName}
                  label={fieldDefinition.label}
                  required={fieldDefinition.required}
                  disabled={fieldDisabled}
                  helperText={fieldState.error?.message}
                  state={fieldState.error ? State.error : State.default}
                />
              );
            }}
          />
        ))}
      </div>
      {helperLinks && (
        <div className="auth-form-helper-links">{helperLinks}</div>
      )}
    </AuthScreenShell>
  );
};
