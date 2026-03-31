import { useTranslation, Loading as BaseLoading } from "@sito/dashboard";

// styles
import "./styles.css";

// types
import { ImportDialogLoadingProps } from "./types";

/**
 * Shows a loading state while an import file is being processed.
 * @param props - Loading view props.
 * @returns Loading indicator element.
 */
export function Loading(props: ImportDialogLoadingProps) {
  const { message, className = "" } = props;
  const { t } = useTranslation();

  return (
    <div className={`import-loading ${className}`}>
      <BaseLoading loaderClass="w-5 h-5" className="!w-auto" />
      <span>
        {message ??
          t("_messages:loading.processingFile", {
            defaultValue: "Processing file...",
          })}
      </span>
    </div>
  );
}
