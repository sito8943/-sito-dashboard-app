import { useTranslation } from "@sito/dashboard";

// styles
import "./styles.css";

type ErrorProps = {
  message?: string | null;
  className?: string;
};

export function Error(props: ErrorProps) {
  const { message, className = "" } = props;
  const { t } = useTranslation();

  if (message === null) return null;

  return (
    <p className={`import-error-message ${className}`}>
      {message ?? t("_messages:errors.parseFile", { defaultValue: "Failed to process file" })}
    </p>
  );
}
