import { MutationFunction } from "@tanstack/react-query";

// @sito/dashboard
import { ActionType } from "@sito/dashboard";

// lib
import { BaseEntityDto, HttpError } from "lib";

// components
import { ExportDialogPropsType } from "components";

// hooks
import { UseBaseFormProps } from "../../forms";

// shared
import { RenderExtraFields } from "../shared";

export interface UseExportDialogPropsType<
  TExtra extends Record<string, unknown> = Record<string, never>,
  TOutput = unknown,
> extends UseBaseFormProps<TOutput, HttpError> {
  entity: string;
  mutationFn: MutationFunction<TOutput, TExtra>;
  defaultExtra?: TExtra;
  renderExtraFields?: RenderExtraFields<TExtra>;
}

export type UseExportDialogReturnType<EntityDto extends BaseEntityDto> =
  ExportDialogPropsType & {
    action: () => ActionType<EntityDto>;
  };
