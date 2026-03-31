import { ReactNode } from "react";

// lib
import { ImportPreviewDto } from "lib";

// components
import { ButtonPropsType, DialogPropsType } from "components";

export interface ImportDialogPropsType<EntityDto extends ImportPreviewDto>
  extends DialogPropsType {
  handleSubmit: () => void;
  isLoading?: boolean;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean },
  ) => Promise<EntityDto[]>;
  onFileProcessed?: (items: EntityDto[]) => void;
  renderCustomPreview?: (items?: EntityDto[] | null) => ReactNode;
  onOverrideChange?: (override: boolean) => void;
  extraActions?: ButtonPropsType[];
}

export type ImportDialogLoadingProps = {
  message?: string;
  className?: string;
};

export type ImportState<T> = {
  file: File | null;
  previewItems: T[] | null;
  parseError: string | null;
  processing: boolean;
  overrideExisting: boolean;
  inputKey: number;
};

export type ImportAction<T> =
  | { type: "SET_FILE"; file: File | null }
  | { type: "START_PROCESSING" }
  | { type: "SET_PREVIEW"; items: T[] }
  | { type: "SET_ERROR"; message: string }
  | { type: "SET_OVERRIDE"; value: boolean }
  | { type: "RESET" };

export type ErrorProps = {
  message?: string | null;
  className?: string;
};
