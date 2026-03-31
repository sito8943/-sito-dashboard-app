import { useCallback, useEffect, useReducer, useRef } from "react";

// @sito-dashboard
import { FileInput, useTranslation } from "@sito/dashboard";

// components
import { Dialog, DialogActions, ImportDialogPropsType } from "components";
import { Error as ErrorComponent } from "./Error";
import { Loading } from "./Loading";
import { Preview } from "./Preview";

// styles
import "./styles.css";

// lib
import { ImportPreviewDto } from "lib";

// types
import type { ImportState as State, ImportAction as Action } from "./types";

const initialState = <T,>(): State<T> => ({
  file: null,
  previewItems: null,
  parseError: null,
  processing: false,
  overrideExisting: false,
  inputKey: 0,
});

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        file: action.file,
        previewItems: null,
        parseError: null,
        processing: false,
      };
    case "START_PROCESSING":
      return { ...state, processing: true };
    case "SET_PREVIEW":
      return {
        ...state,
        previewItems: action.items,
        parseError: null,
        processing: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        previewItems: null,
        parseError: action.message,
        processing: false,
      };
    case "SET_OVERRIDE":
      return { ...state, overrideExisting: action.value };
    case "RESET":
      return { ...initialState<T>(), inputKey: state.inputKey + 1 };
  }
}

/**
 * Handles file import, preview generation and submit for import workflows.
 * @param props - Import dialog props.
 * @returns Import dialog element.
 */
export const ImportDialog = <EntityDto extends ImportPreviewDto>(
  props: ImportDialogPropsType<EntityDto>,
) => {
  const { t } = useTranslation();
  const {
    children,
    handleSubmit,
    handleClose,
    isLoading = false,
    fileProcessor,
    onFileProcessed,
    renderCustomPreview,
    onOverrideChange,
    open,
    extraActions = [],
    ...rest
  } = props;

  const [state, dispatch] = useReducer(
    reducer<EntityDto>,
    initialState<EntityDto>(),
  );
  const {
    file,
    previewItems,
    parseError,
    processing,
    overrideExisting,
    inputKey,
  } = state;

  const processedCallbackRef = useRef(onFileProcessed);
  const fileProcessorRef = useRef(fileProcessor);

  useEffect(() => {
    processedCallbackRef.current = onFileProcessed;
  }, [onFileProcessed]);

  useEffect(() => {
    fileProcessorRef.current = fileProcessor;
  }, [fileProcessor]);

  useEffect(() => {
    if (!open) dispatch({ type: "RESET" });
  }, [open]);

  const processFile = useCallback(
    async (targetFile: File, override: boolean) => {
      if (!fileProcessorRef.current) return;
      dispatch({ type: "START_PROCESSING" });
      try {
        const items = await fileProcessorRef.current(targetFile, { override });
        dispatch({ type: "SET_PREVIEW", items: items ?? [] });
        processedCallbackRef.current?.(items ?? []);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to parse file";
        dispatch({ type: "SET_ERROR", message });
      }
    },
    [],
  );

  return (
    <Dialog {...rest} open={open} handleClose={handleClose}>
      <FileInput
        key={inputKey}
        onClear={() => {
          dispatch({ type: "SET_FILE", file: null });
          processedCallbackRef.current?.([]);
        }}
        onChange={(e) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          if (!selectedFile) {
            dispatch({ type: "SET_FILE", file: null });
            processedCallbackRef.current?.([]);
            return;
          }
          dispatch({ type: "SET_FILE", file: selectedFile });
          processFile(selectedFile, overrideExisting);
        }}
        label={t("_accessibility:labels.file")}
      />
      <label className="import-override-label">
        <input
          type="checkbox"
          checked={overrideExisting}
          onChange={(e) => {
            const value = e.target.checked;
            dispatch({ type: "SET_OVERRIDE", value });
            onOverrideChange?.(value);
            if (file) processFile(file, value);
          }}
        />
        <span>
          {t("_pages:common.actions.import.override", {
            defaultValue: "Override existing items",
          })}
        </span>
      </label>
      <ErrorComponent message={parseError} />
      {processing && <Loading />}
      {renderCustomPreview
        ? renderCustomPreview(previewItems)
        : !!previewItems &&
          previewItems.length > 0 && <Preview items={previewItems} />}
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
        primaryType="button"
        containerClassName="import-dialog-actions"
        primaryName={t("_accessibility:buttons.ok")}
        primaryAriaLabel={t("_accessibility:ariaLabels.ok")}
        cancelName={t("_accessibility:buttons.cancel")}
        cancelAriaLabel={t("_accessibility:ariaLabels.cancel")}
        extraActions={extraActions}
      />
    </Dialog>
  );
};
