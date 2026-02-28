import { useTranslation, Loading as BaseLoading } from "@sito/dashboard";

// styles
import "./styles.css";

type ImportDialogLoadingProps = {
  message?: string;
  className?: string;
};

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
