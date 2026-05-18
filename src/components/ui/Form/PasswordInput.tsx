import { useState, forwardRef, ForwardedRef } from "react";

// icons
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// components
import { TextInput, TextInputPropsType, useTranslation } from "@sito/dashboard";
import { AppIconButton } from "components";

/**
 * Text input specialized for passwords with show/hide visibility toggle.
 * @param props - TextInput props.
 * @param ref - Forwarded input ref.
 * @returns Password input element.
 */
export const PasswordInput = forwardRef(function (
  props: TextInputPropsType,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput {...props} type={showPassword ? "text" : "password"} ref={ref}>
      <AppIconButton
        type="button"
        tabIndex={-1}
        aria-label={t(
          showPassword
            ? "_accessibility:ariaLabels.hidePassword"
            : "_accessibility:ariaLabels.showPassword",
        )}
        className="password-icon"
        onClick={() => setShowPassword(!showPassword)}
        icon={showPassword ? faEyeSlash : faEye}
      />
    </TextInput>
  );
});
