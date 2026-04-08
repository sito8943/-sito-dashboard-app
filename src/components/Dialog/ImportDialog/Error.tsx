import { useTranslation } from "@sito/dashboard";

// lib
import { classNames } from "lib";

// styles
import "./styles.css";

// types
import { ErrorProps } from "./types";

/**
 * Displays parse or processing errors inside the import dialog flow.
 * @param props - Error view props.
 * @returns Error message element.
 */
export function Error(props: ErrorProps) {
  const { message, className = "" } = props;
  const { t } = useTranslation();

  return (
    <p className={classNames("import-error-message", className)}>
      {message ??
        t("_messages:errors.parseFile", {
          defaultValue: "Failed to process file",
        })}
    </p>
  );
}
