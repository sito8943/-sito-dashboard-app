import { ImportPreviewDto } from "./ImportPreviewDto";

export type ImportDto<TDto extends ImportPreviewDto> = {
  override: boolean;
  items: TDto[];
};
