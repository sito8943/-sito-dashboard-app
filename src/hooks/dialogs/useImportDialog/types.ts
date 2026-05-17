import { MutationFunction, QueryKey } from "@tanstack/react-query";

// @sito/dashboard
import { ActionType } from "@sito/dashboard";

// lib
import { BaseEntityDto, HttpError, ImportDto, ImportPreviewDto } from "lib";

// components
import { ImportDialogPropsType } from "components";

// hooks
import { UseBaseFormProps } from "../../forms";

// shared
import { ExtraFieldsContext, RenderExtraFields } from "../shared";

/** @deprecated Use `ExtraFieldsContext` from `hooks/dialogs/shared`. */
export type ImportDialogExtraFieldsContext<
  TExtra extends Record<string, unknown>,
> = ExtraFieldsContext<TExtra>;

export interface UseImportDialogPropsType<
  PreviewEntityDto extends ImportPreviewDto,
  TExtra extends Record<string, unknown> = Record<string, never>,
> extends UseBaseFormProps<PreviewEntityDto, HttpError> {
  queryKey: QueryKey;
  entity: string;
  mutationFn: MutationFunction<number, ImportDto<PreviewEntityDto> & TExtra>;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean },
  ) => Promise<PreviewEntityDto[]>;
  renderCustomPreview?: ImportDialogPropsType<PreviewEntityDto>["renderCustomPreview"];
  defaultExtra?: TExtra;
  renderExtraFields?: RenderExtraFields<TExtra>;
}

export type UseImportDialogReturnType<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
> = ImportDialogPropsType<PreviewEntityDto> & {
  action: () => ActionType<EntityDto>;
};
