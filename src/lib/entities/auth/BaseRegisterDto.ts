import { BaseAuthDto } from "./BaseAuthDto";

export type BaseRegisterDto<
  TExtra extends object = object,
  TAuthExtra extends object = object,
> = BaseAuthDto<TAuthExtra> & {
  rPassword: string;
} & TExtra;
