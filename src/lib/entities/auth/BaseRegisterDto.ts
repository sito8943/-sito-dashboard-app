import { BaseAuthDto } from "./BaseAuthDto";

export type BaseRegisterDto<
  TExtra = Record<string, never>,
  TAuthExtra = Record<string, never>
> = BaseAuthDto<TAuthExtra> & {
  rPassword: string;
} & TExtra;

