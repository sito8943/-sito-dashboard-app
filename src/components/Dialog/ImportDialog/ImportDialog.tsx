import { useCallback, useEffect, useState } from "react";

// @sito/dashboard
import { useTranslation, FileInput } from "@sito/dashboard";

// components
import { Dialog, DialogActions, DialogPropsType } from "components";
import { Loading } from "./Loading";
import { Error as ErrorComponent } from "./Error";
import { Preview } from "./Preview";

// lib
import { ImportPreviewDto } from "lib";

// types
import { ImportDialogPropsType } from "./types";

export const ImportDialog = <EntityDto extends ImportPreviewDto>(
  props: ImportDialogPropsType<EntityDto>
) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<EntityDto[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [overrideExisting, setOverrideExisting] = useState<boolean>(false);

  const {
    children,
    handleSubmit,
    handleClose,
    isLoading = false,
    fileProcessor,
    onFileProcessed,
    onOverrideChange,
    open,
    ...rest
  } = props;

  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviewItems(null);
      setParseError(null);
      setProcessing(false);
      setOverrideExisting(false);
      setInputKey((k) => k + 1);
    }
  }, [open]);

  const handleFileProcessed = useCallback(async () => {
    if (fileProcessor && file) {
      setProcessing(true);
      try {
        const items = await fileProcessor(file, { override: overrideExisting });
        setPreviewItems(items ?? []);
        setParseError(null);
        onFileProcessed?.(items ?? []);
      } catch (err) {
        console.error(err);
        setPreviewItems(null);
        const message =
          err instanceof Error ? err.message : "Failed to parse file";
        setParseError(message);
      }
      setProcessing(false);
    }
  }, [file, fileProcessor, onFileProcessed, overrideExisting]);

  useEffect(() => {
    handleFileProcessed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, overrideExisting]);

  return (
    <Dialog {...rest} open={open} handleClose={handleClose}>
      <FileInput
        key={inputKey}
        onClear={() => {
          setFile(null);
          setPreviewItems(null);
          setParseError(null);
          setProcessing(false);
        }}
        onChange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            setFile(null);
            setPreviewItems(null);
            setParseError(null);
            setProcessing(false);
            return;
          }
          setFile(file);
        }}
        label={t("_accessibility:labels.file")}
      />
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={overrideExisting}
          onChange={(e) => {
            const value = e.target.checked;
            setOverrideExisting(value);
            onOverrideChange?.(value);
          }}
        />
        <span>
          {t("_pages:common.actions.import.override", {
            defaultValue: "Override existing items",
          })}
        </span>
      </label>
      <ErrorComponent message={parseError ?? undefined} />
      {processing && <Loading />}
      {!!previewItems && previewItems.length > 0 && (
        <Preview items={previewItems} />
      )}
      {children}
      <DialogActions
        primaryText={t("_accessibility:buttons.ok")}
        cancelText={t("_accessibility:buttons.cancel")}
        onPrimaryClick={() => {
          const canSubmit =
            !fileProcessor || (!!previewItems && previewItems.length > 0);
          if (canSubmit) handleSubmit();
        }}
        onCancel={handleClose}
        isLoading={isLoading}
        disabled={
          !!isLoading ||
          !!processing ||
          (!!fileProcessor && (!previewItems || previewItems.length === 0))
        }
        primaryType="button"
        containerClassName="mt-5"
        primaryName={t("_accessibility:buttons.ok")}
        primaryAriaLabel={t("_accessibility:ariaLabels.ok")}
        cancelName={t("_accessibility:buttons.cancel")}
        cancelAriaLabel={t("_accessibility:ariaLabels.cancel")}
      />
    </Dialog>
  );
};
