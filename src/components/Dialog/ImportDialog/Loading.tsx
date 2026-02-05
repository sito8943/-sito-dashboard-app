import { useTranslation, Loading as BaseLoading } from "@sito/dashboard";

type ImportDialogLoadingProps = {
  message?: string;
  className?: string;
};

export function Loading(props: ImportDialogLoadingProps) {
  const { message, className = "" } = props;
  const { t } = useTranslation();

  return (
    <div
      className={`my-4 mx-auto flex items-center gap-3 text-sm text-gray-600 ${className}`}
    >
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
