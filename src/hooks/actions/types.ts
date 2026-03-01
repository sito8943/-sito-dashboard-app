import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface UseActionPropTypes {
  hidden?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  sticky?: boolean;
  multiple?: boolean;
  icon?: IconDefinition;
  tooltip?: string;
  id?: string;
}

export interface UseSingleActionPropTypes<TInDto> extends UseActionPropTypes {
  onClick: (record: TInDto) => void;
}

export interface UseMultipleActionPropTypes<TInDto> extends UseActionPropTypes {
  onClick: (record: TInDto[]) => void;
}

export interface UseExportAction extends UseActionPropTypes {
  onClick: () => void;
}

export type UseImportAction = UseExportAction;

export enum GlobalActions {
  Add = "add",
  Edit = "edit",
  Delete = "delete",
  Restore = "restore",
  Refresh = "refresh",
  Export = "export",
  Import = "import",
}
