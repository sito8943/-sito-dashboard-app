import { ReactNode } from "react";
import { ImportPreviewDto } from "lib";
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
