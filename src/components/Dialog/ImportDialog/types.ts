import { ImportPreviewDto } from "lib";
import { DialogPropsType } from "components";

export interface ImportDialogPropsType<EntityDto extends ImportPreviewDto>
  extends DialogPropsType {
  handleSubmit: () => void;
  isLoading?: boolean;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean }
  ) => Promise<EntityDto[]>;
  onFileProcessed?: (items: EntityDto[]) => void;
  onOverrideChange?: (override: boolean) => void;
}
