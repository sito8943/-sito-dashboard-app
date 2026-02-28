import { ForwardedRef, forwardRef } from "react";

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

  return (
    <div className={`form-paragraph-container ${containerClassName}`}>
      <textarea
        ref={ref}
        name={name}
        id={id}
        className={`text-input text-area form-paragraph-textarea ${inputStateClassName(state)} ${inputClassName}`}
        required={required}
        value={value}
        onChange={onChange}
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
