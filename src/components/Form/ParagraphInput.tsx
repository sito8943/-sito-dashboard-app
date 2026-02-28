import { ChangeEvent, ForwardedRef, forwardRef, useState } from "react";

// @sito/dashboard
import {
  labelStateClassName,
  inputStateClassName,
  helperTextStateClassName,
  State,
} from "@sito/dashboard";

// types
import { ParagraphInputPropsType } from "./types";

// styles
import "./styles.css";

const hasInputValue = (inputValue: string | number | readonly string[] | undefined) => {
  if (inputValue === undefined || inputValue === null) return false;
  return `${inputValue}`.length > 0;
};

/**
 * ParagraphInput
 * @param {object} props
 * @returns ParagraphInput Component
 */
export const ParagraphInput = forwardRef(function (
  props: ParagraphInputPropsType,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const {
    value,
    defaultValue,
    onChange,
    state = State.default,
    name = "",
    id = "",
    label = "",
    disabled = false,
    required = false,
    containerClassName = "",
    inputClassName = "",
    labelClassName = "",
    helperText = "",
    helperTextClassName = "",
    ...rest
  } = props;

  const isControlled = value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
    hasInputValue(defaultValue as string)
  );

  const hasValue = isControlled ? hasInputValue(value as string) : uncontrolledHasValue;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setUncontrolledHasValue(event.currentTarget.value.length > 0);
    }
    onChange?.(event);
  };

  return (
    <div className={`form-paragraph-container group ${containerClassName}`}>
      <textarea
        ref={ref}
        name={name}
        id={id}
        className={`text-input text-area form-paragraph-textarea peer ${inputStateClassName(state)} ${hasValue ? "has-value" : ""} ${rest.placeholder ? "has-placeholder" : ""} ${inputClassName}`}
        required={required}
        defaultValue={defaultValue}
        {...(isControlled ? { value } : {})}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      ></textarea>
      <label
        htmlFor={id}
        className={`text-input-label ${labelStateClassName(state)} ${labelClassName}`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      {!!helperText && (
        <p
          className={`text-input-helper-text ${helperTextStateClassName(state)} ${helperTextClassName}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});
